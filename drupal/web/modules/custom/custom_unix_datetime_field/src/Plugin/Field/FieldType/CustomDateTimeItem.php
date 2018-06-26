<?php

namespace Drupal\graphql_custom_translation\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;

/**
 * Plugin implementation of the 'datetime' field type.
 *
 * @FieldType(
 *   id = "datetime",
 *   label = @Translation("Date"),
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

		$properties['value'] = DataDefinition::create('datetime_iso8601')
				->setLabel(t('Date value'))
				->setRequired(TRUE);

		$properties['date'] = DataDefinition::create('any')
				->setLabel(t('Computed date'))
				->setDescription(t('The computed DateTime object.'))
				->setComputed(TRUE)
				->setClass('\Drupal\datetime\DateTimeComputed')
				->setSetting('date source', 'value');

		$properties['unix'] = DataDefinition::create('any')
				->setLabel(t('Computed date'))
				->setDescription(t('The computed DateTime object.'))
				->setComputed(TRUE)
				->setClass('\Drupal\graphql_custom_translation\UnixDateTime')
				->setSetting('date source', 'value');

		return $properties;
	}

}
