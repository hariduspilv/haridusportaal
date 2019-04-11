<?php

namespace Drupal\content_sync\Normalizer;

use Drupal\content_sync\ContentSyncManager;
use Drupal\content_sync\Plugin\SyncNormalizerDecoratorManager;
use Drupal\content_sync\Plugin\SyncNormalizerDecoratorTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Url;
use Drupal\serialization\Normalizer\ContentEntityNormalizer as BaseContentEntityNormalizer;

/**
 * Adds the file URI to embedded file entities.
 */
class ContentEntityNormalizer extends BaseContentEntityNormalizer {

  use SyncNormalizerDecoratorTrait;

  /**
   * @var SyncNormalizerDecoratorManager
   */
  protected $decoratorManager;

  /**
   * Constructs an EntityNormalizer object.
   *
   * @param EntityTypeManagerInterface $entity_manager
   *
   * @param SyncNormalizerDecoratorManager $decorator_manager
   */
  public function __construct(EntityTypeManagerInterface $entity_manager, SyncNormalizerDecoratorManager $decorator_manager) {
    parent::__construct($entity_manager);
    $this->decoratorManager = $decorator_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize($data, $class, $format = NULL, array $context = []) {
    if (is_null($data)) {
      return NULL;
    }
    $original_data = $data;

    // Get the entity type ID while letting context override the $class param.
    $entity_type_id = !empty($context['entity_type']) ? $context['entity_type'] : $this->entityManager->getEntityTypeFromClass($class);

    $bundle = FALSE;
    /** @var \Drupal\Core\Entity\EntityTypeInterface $entity_type_definition */
    // Get the entity type definition.
    $entity_type_definition = $this->entityManager->getDefinition($entity_type_id, FALSE);
    if ($entity_type_definition->hasKey('bundle')) {
      $bundle_key = $entity_type_definition->getKey('bundle');
      // Get the base field definitions for this entity type.
      $base_field_definitions = $this->entityManager->getBaseFieldDefinitions($entity_type_id);

      // Get the ID key from the base field definition for the bundle key or
      // default to 'value'.
      $key_id = isset($base_field_definitions[$bundle_key]) ? $base_field_definitions[$bundle_key]->getFieldStorageDefinition()
        ->getMainPropertyName() : 'value';

      // Normalize the bundle if it is not explicitly set.
      $bundle = isset($data[$bundle_key][0][$key_id]) ? $data[$bundle_key][0][$key_id] : (isset($data[$bundle_key]) ? $data[$bundle_key] : NULL);
    }

    // Decorate data before denormalizing it.
    $this->decorateDenormalization($data, $entity_type_id, $format, $context);

    // Resolve references
    $this->fixReferences($data, $entity_type_id, $bundle);

    // Remove invalid fields
    $this->cleanupData($data, $entity_type_id, $bundle);

    // Data to Entity
    $entity = parent::denormalize($data, $class, $format, $context);

    // Decorate denormalized entity before retuning it.
    $this->decorateDenormalizedEntity($entity, $original_data, $format, $context);

    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = NULL, array $context = []) {
    /* @var ContentEntityInterface $object */
    $normalized_data = parent::normalize($object, $format, $context);

    $normalized_data['_content_sync'] = $this->getContentSyncMetadata($object, $context);

    /**
     * @var \Drupal\Core\Entity\ContentEntityBase $object
     */
    $referenced_entities = $object->referencedEntities();

    // Add node uuid for menu link if any.
    if ($object->getEntityTypeId() == 'menu_link_content') {
      if ($entity = $this->getMenuLinkNodeAttached($object)) {
        $normalized_data['_content_sync']['menu_entity_link'][$entity->getEntityTypeId()] = $entity->uuid();
        $referenced_entities[] = $entity;
      }
    }

    if (!empty($referenced_entities)) {
      $dependencies = [];
      foreach ($referenced_entities as $entity) {
        $reflection = new \ReflectionClass($entity);
        if ($reflection->implementsInterface(ContentEntityInterface::class)) {
          $ids = [
            $entity->getEntityTypeId(),
            $entity->bundle(),
            $entity->uuid(),
          ];
          $dependency = implode(ContentSyncManager::DELIMITER, $ids);
          if (!in_array($dependency, $dependencies)) {
            $dependencies[$entity->getEntityTypeId()][] = $dependency;
          }
        }
      }
      $normalized_data['_content_sync']['entity_dependencies'] = $dependencies;
    }
    // Decorate normalized entity before retuning it.
    if (is_a($object, ContentEntityInterface::class, TRUE)) {
      $this->decorateNormalization($normalized_data, $object, $format, $context);
    }
    return $normalized_data;
  }

  /**
   * Gets a node attached to a menu link. The node has already been imported.
   *
   * @param \Drupal\Core\Entity\EntityInterface $object
   *   Menu Link Entity
   *
   * @return bool|\Drupal\Core\Entity\EntityInterface|null
   *   Node Entity.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   */
  protected function getMenuLinkNodeAttached($object) {
    $entity = FALSE;

    $uri = $object->get('link')->getString();
    $url = Url::fromUri($uri);
    $route_parameters = NULL;
    try {
      $route_parameters = $url->getRouteParameters();
    }
    catch (\Exception $e) {
      // If menu link is linked to a non-node page - just do nothing.
    }
    if (count($route_parameters) == 1) {
      $entity_id = reset($route_parameters);
      $entity_type = key($route_parameters);
      $entity = \Drupal::entityTypeManager()->getStorage($entity_type)->load($entity_id);
    }
    return $entity;
  }

  /**
   * @inheritdoc
   */
  public function supportsNormalization($data, $format = NULL) {
    return parent::supportsNormalization($data, $format) && !empty($data->is_content_sync);
  }

  /**
   * @inheritdoc
   */
  public function supportsDenormalization($data, $type, $format = NULL) {
    return parent::supportsDenormalization($data, $type, $format);
  }

  /**
   * @param $object
   * @param array $context
   *
   * @return array
   */
  protected function getContentSyncMetadata($object, $context = []) {
    $metadata = [
      'entity_type' => $object->getEntityTypeId(),
    ];
    return $metadata;
  }

  /**
   * @inheritdoc
   */
  protected function getDecoratorManager() {
    return $this->decoratorManager;
  }

  /**
   * @param array $data
   * @param $entity_type_id
   *
   * @return array
   */
  protected function fixReferences(&$data, $entity_type_id, $bundle = FALSE) {
    if ($bundle) {
      $field_definitions = $this->entityManager->getFieldDefinitions($entity_type_id, $bundle);
    }
    else {
      $bundles = array_keys($this->entityManager->getBundleInfo($entity_type_id));
      $field_definitions = [];
      foreach ($bundles as $bundle) {
        $field_definitions_bundle = $this->entityManager->getFieldDefinitions($entity_type_id, $bundle);
        if (is_array($field_definitions_bundle)) {
          $field_definitions += $field_definitions_bundle;
        }
      }
    }
    foreach ($field_definitions as $field_name => $field_definition) {
      // We are only interested in importing content entities.
      if (!is_a($field_definition->getClass(), '\Drupal\Core\Field\EntityReferenceFieldItemList', TRUE)) {
        continue;
      }
      if (!empty($data[$field_name]) && is_array($data[$field_name])) {
        $key = $field_definition->getFieldStorageDefinition()
          ->getMainPropertyName();
        foreach ($data[$field_name] as $i => &$item) {
          if (!empty($item['target_uuid'])) {
            $reference = $this->entityManager->loadEntityByUuid($item['target_type'], $item['target_uuid']);
            if ($reference) {
              $item[$key] = $reference->id();
              if (is_a($reference, RevisionableInterface::class, TRUE)) {
                $item['target_revision_id'] = $reference->getRevisionId();
              }
            }
            else {
              $reflection = new \ReflectionClass($this->entityManager->getStorage($item['target_type'])->getEntityType()->getClass());
              if ($reflection->implementsInterface(ContentEntityInterface::class)) {
                unset($data[$field_name][$i]);
              }
            }
          }
        }
      }
    }
    return $data;
  }

  /**
   * @param $data
   * @param $entity_type_id
   */
  protected function cleanupData(&$data, $entity_type_id, $bundle = FALSE) {
    if ($bundle) {
      $field_definitions = $this->entityManager->getFieldDefinitions($entity_type_id, $bundle);
    }
    else {
      $bundles = array_keys($this->entityManager->getBundleInfo($entity_type_id));
      $field_definitions = [];
      foreach ($bundles as $bundle) {
        $field_definitions_bundle = $this->entityManager->getFieldDefinitions($entity_type_id, $bundle);
        if (is_array($field_definitions_bundle)) {
          $field_definitions += $field_definitions_bundle;
        }
      }
    }
    $field_names = array_keys($field_definitions);
    foreach ($data as $field_name => $field_data) {
      if (!in_array($field_name, $field_names)) {
        unset($data[$field_name]);
      }
    }
  }

}
