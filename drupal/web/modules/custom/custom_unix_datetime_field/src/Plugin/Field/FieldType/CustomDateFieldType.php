<?php

namespace Drupal\custom_unix_datetime_field\Plugin\Field\FieldType;

use Drupal\Component\Utility\Random;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\datetime\Plugin\Field\FieldType\DateTimeItem;

/**
 * Plugin implementation of the 'datetime_unix' field type.
 *
 * @FieldType(
 *   id = "datetime_unix",
 *   label = @Translation("Datetime Unix timestamp"),
 *   description = @Translation("Create and store date values."),
 *   default_widget = "datetime_default",
 *   default_formatter = "datetime_default",
 *   list_class = "\Drupal\datetime\Plugin\Field\FieldType\DateTimeFieldItemList"
 * )
 */
class CustomDateFieldType extends DateTimeItem {


	public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
		$properties = parent::propertyDefinitions($field_definition);

		$properties['unix'] = DataDefinition::create('any')
			->setLabel(t('Computed date'))
			->setDescription(t('The computed DateTime object.'))
			->setComputed(TRUE)
			->setClass('\Drupal\custom_unix_datetime_field\UnixDateTime')
			->setSetting('date source', 'value');
		return $properties;
	}

}
