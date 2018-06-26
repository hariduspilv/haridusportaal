<?php

namespace Drupal\custom_datetime_unix_value\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;

/**
 * Plugin implementation of the 'datetime' field type.
 *
 * @FieldType(
 *   id = "datetime_unix",
 *   label = @Translation("Date with unix field"),
 *   description = @Translation("Create and store date values."),
 *   default_widget = "datetime_default",
 *   default_formatter = "datetime_default",
 *   list_class = "\Drupal\datetime\Plugin\Field\FieldType\DateTimeFieldItemList",
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
			->setClass('\Drupal\custom_datetime_unix_value\UnixDateTime')
			->setSetting('date source', 'value');
		return $properties;
	}

}

