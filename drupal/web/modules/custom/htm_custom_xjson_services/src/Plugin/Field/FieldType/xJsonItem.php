<?php

namespace Drupal\htm_custom_xjson_services\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Field\Plugin\Field\FieldType\MapItem;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Defines the 'entity_reference_revisions' entity field type.
 *
 * Supported settings (below the definition's 'settings' key) are:
 * - target_type: The entity type to reference. Required.
 * - target_bundle: (optional): If set, restricts the entity bundles which may
 *   may be referenced. May be set to an single bundle, or to an array of
 *   allowed bundles.
 *
 * @FieldType(
 *   id = "custom_xjson_item",
 *   label = @Translation("JSON"),
 *   description = @Translation("This field stores a JSON object or an array of JSON objects."),
 *   category = @Translation("Document"),
 *   default_widget = "jsonb_textarea",
 *   default_formatter = "jsonb_default"
 * )
 */
class xJsonItem extends FieldItemBase {



	/**
	 * @inheritDoc
	 */
	public static function schema(FieldStorageDefinitionInterface $field_definition)
	{
		#return parent::schema($field_definition);
		return [
			'columns' => [
				'value' => [
					'type' => 'bytea',
					'not null' => FALSE,
				],
			],
		];
	}


	/**
	 * {@inheritdoc}
	 */
	public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
		$properties['value'] = DataDefinition::create('string')
				->setLabel(t('JSON value'));

		return $properties;
	}


	public function setValue($values, $notify = TRUE) {
		$this->values = [];
		if (!isset($values)) {
			return;
		}

		if (!is_array($values)) {
			if ($values instanceof MapItem) {
				$values = $values->getValue();
			}
			else {
				$values = unserialize($values);
			}
		}

		$this->values = $values;

		// Notify the parent of any changes.
		if ($notify && isset($this->parent)) {
			$this->parent->onChange($this->name);
		}
	}

	/**
	 * {@inheritdoc}
	 */
	public function __get($name) {
		if (!isset($this->values[$name])) {
			$this->values[$name] = [];
		}

		return $this->values[$name];
	}

	/**
	 * {@inheritdoc}
	 */
	public function __set($name, $value) {
		if (isset($value)) {
			$this->values[$name] = $value;
		}
		else {
			unset($this->values[$name]);
		}
	}

}
