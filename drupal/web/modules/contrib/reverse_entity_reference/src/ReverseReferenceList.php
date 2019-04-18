<?php

namespace Drupal\reverse_entity_reference;

use Drupal\Core\TypedData\TypedDataInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\dynamic_entity_reference\Plugin\Field\FieldType\DynamicEntityReferenceFieldItemList;
use Drupal\Core\Entity\Query\QueryException;

/**
 * A computed field that provides reverse entity references.
 *
 * The definition of the Computed Field List is based on that 
 * of content_moderation module.
 */

class ReverseReferenceList extends DynamicEntityReferenceFieldItemList {
	
	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityTypeManager;

	/**
	 * The entity field manager.
	 *
	 * @var \Drupal\Core\Entity\EntityFieldManagerInterface
	 */
	protected $entityFieldManager;
	
	/**
	 * The field type plugin manager
	 *
	 * @var \Drupal\Core\Field\FieldTypePluginManagerInterface
	 */
	protected $fieldTypeManager;

	/**
	 * The configuration object factory.
	 *
	 * @var \Drupal\Core\Config\ConfigFactoryInterface
	 */
	protected $configFactory;

	/**
	 * The configuration object factory.
	 *
	 * @var \Drupal\Core\Logger\LoggerChannelInterface
	 */
	protected $logger;

	/**
	 * Constructs a BackReferenceProcessed object.
	 *
	 * @param \Drupal\Core\TypedData\DataDefinitionInterface $definition
	 *   The data definition.
	 * @param string $name
	 *   (optional) The name of the created property, or NULL if it is the root
	 *   of a typed data tree. Defaults to NULL.
	 * @param \Drupal\Core\TypedData\TypedDataInterface $parent
	 *   (optional) The parent object of the data property, or NULL if it is the
	 *   root of a typed data tree. Defaults to NULL.
	 */
	public function __construct($definition, $name = NULL, TypedDataInterface $parent = NULL) {
		parent::__construct($definition, $name, $parent);
		// statically includes the managers, since DI isn't available
		$this->entityTypeManager = \Drupal::service('entity_type.manager');
		$this->entityFieldManager = \Drupal::service('entity_field.manager');
		$this->configFactory = \Drupal::service('config.factory');
		$this->fieldTypeManager =  \Drupal::service('plugin.manager.field.field_type');
		$this->logger = \Drupal::logger('reverse_entity_reference');
	}
	
	/**
	 * {@inheritdoc}
	 */
	public function get($index) {
		$this->computeReverseReferenceList();
	  return parent::get($index);
	}

	/**
	 * {@inheritdoc}
	 */
	public function getIterator() {
		$this->computeReverseReferenceList();
		return parent::getIterator();
	}
	
	/**
	 * {@inheritdoc}
	 */
	public function isEmpty() {
		$this->computeReverseReferenceList();
		return parent::isEmpty();
	}

	/**
	 * {@inheritdoc}
	 */
	public function getValue($include_computed = FALSE) {
		$this->computeReverseReferenceList();
		return parent::getValue($include_computed);
	}

	
	/**
	 * {@inheritdoc}
	 */
	public function referencedEntities() {
		$this->computeReverseReferenceList();
		return parent::referencedEntities();
	}

	/**
	 * Recalculate the reverse reference field item list.
	 */
	protected function computeReverseReferenceList() {
		// Compute the value of the moderation state.
		$index = 0;
		if (!isset($this->list[$index]) || $this->list[$index]->isEmpty()) {
			$reverse_references = $this->getReverseReferences();
			foreach($reverse_references as $reference){

				if (!empty($reference)) {
					
					$this->list[$index] = $this->createItem($index, [
						'target_id' => $reference['referring_entity_id'],
						'target_type' => $reference['referring_entity_type']
					]);
					// add virtual field to store field type
					$this->list[$index]->field_name = $reference['field_name'];
				}
				$index++;
			}
		}
	}

	/**
	 *  Load all the reverse references for this entity.
	 * 
	 * @return array
	 *   A table of referring entities providing field name, entity type and entity id.
	 */
	public function getReverseReferences() {
		$reference_map = array();
		$entity = $this->getEntity();
		$entity_type = $entity->getEntityType();
		$bundle = $entity->bundle();

		$entities = array();
		$allowed_field_types = $this->configFactory->get('reverse_entity_reference.settings')->get('allowed_field_types');
		$disallowed_entity_types = $this->configFactory->get('reverse_entity_reference.settings')->get('disallowed_entity_types');
		$allow_custom_storage = $this->configFactory->get('reverse_entity_reference.settings')->get('allow_custom_storage');
		
		$allowed_field_types = isset($allowed_field_types) ? $allowed_field_types : ['entity_reference'];
		$disallowed_entity_types = isset($disallowed_entity_types) ? $disallowed_entity_types : [];
		$allow_custom_storage = isset($allow_custom_storage) ? $allow_custom_storage : false;
		
		foreach( $allowed_field_types as $field_type ){
			$entities = array_merge_recursive($entities, $this->entityFieldManager->getFieldMapByFieldType($field_type));
		}
		// loop through all the entity fields that are entity references
		foreach($entities as $referring_entity => $entity_fields){
			$field_definitions = $this->entityFieldManager->getFieldStorageDefinitions($referring_entity);
			
			// Skip disallowed entities
			if (in_array($referring_entity, $disallowed_entity_types)){
				continue;
			}

			foreach ($entity_fields as $field_name => $field) {

				// Get field storage definition if available
				if (!isset($field_definitions[$field_name])) {
					continue;
				}
				
				$field_definition = $field_definitions[$field_name];
				// isQueryable will be removed in Drupal 9.x 
				// TODO: should also check if isComputed but have to check if supported first

				$has_custom_storage = $field_definition->hasCustomStorage() || !$field_definition->isQueryable();
				
				// Skip fields with custom storage unless otherwise stated
				if (!$allow_custom_storage && $has_custom_storage){
					continue;
				}

				$field_type_class = $this->fieldTypeManager->getPluginClass($field_definition->getType());
				
				$multi_target = is_a($field_type_class, "Drupal\dynamic_entity_reference\Plugin\Field\FieldType\DynamicEntityReferenceItem", TRUE);
				
				$target_type = $field_definition->getSetting('target_type');
				$handler_settings = $field_definition->getSetting('handler_settings');

				if (isset($handler_settings['target_bundles'])) {
					$target_bundles = $handler_settings['target_bundles'];
				} else {
					$target_bundles = ['all'];
				}

				// Check if this entity type (and bundle) is a target of this field.
				if(!$multi_target){
					if ($entity_type->getBundleOf() == $target_type || $entity_type->id() == $target_type) {
						if ($this->entityTypeManager->getDefinition($referring_entity)->getKey('id')) {

							if (in_array('all', $target_bundles)){
								$reference_map = array_merge($reference_map, $this->getReferrers($entity, $referring_entity, $field_name, $has_custom_storage));
							} elseif(in_array($bundle, $target_bundles)) {
								$reference_map = array_merge($reference_map, $this->getReferrers($entity, $referring_entity, $field_name, $has_custom_storage, $field['bundles']));
							}

						}
					}
				} else {
					$target_types = $field_definition->getSetting('entity_type_ids');
					// TODO: This could be buggy because of the way dynamic entity reference works
					// because nothing stops you from putting a EntityC reference on a DER whose
					// settings only specify that it is for EntityTypeA and EntityTypeB.
					// Should probably query regardless ...
					// TODO: Also should look into whether target bundles work ...
					if (in_array($entity_type->id(), $target_types)){
						if (in_array('all', $target_bundles)){
							$reference_map = array_merge($reference_map, $this->getReferrers($entity, $referring_entity, $field_name, $has_custom_storage));
						} elseif(in_array($bundle, $target_bundles)) {
							$reference_map = array_merge($reference_map, $this->getReferrers($entity, $referring_entity, $field_name, $has_custom_storage, $field['bundles']));
						}
					}
				}
			}
		}
		return $reference_map;
	}
	
	/**
	 * Get all the entities referring this entity given an entity type and field name
	 *
	 * @param \Drupal\Core\Entity\EntityInteface $referenced
	 *   The referenced entity.
	 * @param string $referring_entity
	 *   The referring entity type.
	 * @param string $field_name
	 *   The referring field on that entity type
	 * @param bool $has_custom_storage
	 *   Whether to load reverse references from custom storage or regular entity query 
	 * @param string[] $bundles
	 *   (optional) The bundles that use the referring field. Defaults to array(NULL).
	 * @return array
	 *   A table of referring entities providing field name, entity type and entity id
	 */
	protected function getReferrers(EntityInterface $referenced, $referring_entity, $field_name, $has_custom_storage, $bundles = array(NULL)){
		$referring_entities = array();
		$referring_entity_storage =  $this->entityTypeManager->getStorage($referring_entity);
		foreach($bundles as $referring_bundle){
			unset($result);
			$result = $this->doGetReferrers($referring_entity_storage, $field_name, $has_custom_storage ,$referring_bundle);
			if (isset($result)) {
				foreach($result as $referrer_id) {
					$referring_entities[] = array(
						'referring_entity_type' => $referring_entity,
						'field_name' => $field_name,
						'referring_entity_id' => $referrer_id
					);
				}
			}
		}
		return $referring_entities;
	}

	/**
	 * Get all the entities referring this entity given an entity type and field name
	 *
	 * @param \Drupal\Core\Entity\EntityStorageInteface $referring_entity_storage
	 *   The storage class for the referring entity type.
	 * @param string $field_name
	 *   The name of the field used to refer to this entity type.
	 * @param bool $has_custom_storage
	 *   Whether to load reverse references from custom storage or regular entity query 
	 * @param string|NULL $referring_bundle
	 *   (optional) The bundle that of the referring entity type that
	 *   can reference the referred entity.
	 * @return int[] 
	 *   an array of entity ids. (on failure returns empty array)
	 */
	protected function doGetReferrers(EntityStorageInterface $referring_entity_storage, $field_name, $has_custom_storage ,$referring_bundle = NULL){
		$result = array();

		if($has_custom_storage){
			$referring_entities = $referring_entity_storage->loadMultiple();
			$referring_entities = array_filter($referring_entities, function($entity) use ($field_name, $referring_bundle){
				if(!isset($referring_bundle) || $entity->bundle() == $referring_bundle){
					$refers_to = array_column($entity->get($field_name)->getValue(), 'target_id');
					return in_array($this->getEntity()->id(), $refers_to);
				}
				return false;
			});
			$result = array_map(function($entity) {
				return $entity->id();
			} , $referring_entities);
		} else {
			try {
				if (isset($referring_bundle)) {
					$result = $referring_entity_storage->getQuery()
						->condition('type', $referring_bundle)
						->condition($field_name, $this->getEntity()->id())
						->execute();
				} else {
					$result = $referring_entity_storage->getQuery()
						->condition($field_name, $this->getEntity()->id())
						->execute();
				}

			} catch( QueryException $e) {
				$this->logger->error(
					"Something went wrong with querying the DB for reverse references. ".
					"Probably an improperly reported field type (consider contacting the field type module creator). ".
					"Field Type: @field_type ".
					"Entity Type: @entity_type ".
					"Bundle: @bundle ".
					"PHP Exception: @exception",
					array(
						"@field_type" => $field_name,
						"@entity_type" => $referring_entity_storage->getEntityTypeId(),
						"@bundle" => ($referring_bundle?:"all"),
						"@exception" => $e->getMessage()
					)
				);
			}
		}
		return $result;
	}

}
