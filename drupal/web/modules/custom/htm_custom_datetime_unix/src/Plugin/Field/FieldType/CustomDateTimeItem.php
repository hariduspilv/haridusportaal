<?php

namespace Drupal\htm_custom_datetime_unix\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;

/**
 * Plugin implementation of the 'datetime_c' field type.
 *
 * @FieldType(
 *   id = "datetime",
 *   label = @Translation("Date with unix field"),
 *   description = @Translation("Create and store date values."),
 *   default_widget = "datetime_default",
 *   default_formatter = "datetime_default",
 *   constraints = {"DateTimeFormat" = {}}
 * )
 */

class CustomDateTimeItem extends DateTimeItem {


	/**
	 * {@inheritdoc}
	 */
	public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
		$properties = parent::propertyDefinitions($field_definition);

		$properties['unix'] = DataDefinition::create('any')
			->setLabel(t('Computed date'))
			->setDescription(t('The computed DateTime object.'))
			->setComputed(TRUE)
			->setClass('\Drupal\htm_custom_datetime_unix\UnixDateTime')
			->setSetting('date source', 'value');
		return $properties;
	}

	public static function schema(FieldStorageDefinitionInterface $field_definition) {
		return parent::schema($field_definition);
	}



}

