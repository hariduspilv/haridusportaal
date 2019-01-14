<?php

namespace Drupal\htm_custom_favorites\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Field\Plugin\Field\FieldType\EntityReferenceItem;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'favorite_field_type' field type.
 *
 * @FieldType(
 *   id = "favorite_field_type",
 *   label = @Translation("Favorite field type"),
 *   description = @Translation("Favorite field"),
 *   default_widget = "favorite_widget_type",
 *   default_formatter = "favorite_formatter_type",
 * 	 list_class = "\Drupal\Core\Field\EntityReferenceFieldItemList"
 * )
 */
class FavoriteFieldType extends EntityReferenceItem {

	public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
		$properties = parent::propertyDefinitions($field_definition);
		$properties['title'] = DataDefinition::create('string')
			->setLabel(new TranslatableMarkup('Title'))
			->setRequired(TRUE);
		return $properties;
	}

	public static function schema(FieldStorageDefinitionInterface $field_definition) {
		$schema = parent::schema($field_definition);
		$schema['columns']['title'] = [
			'type' => 'varchar',
			'length' => 225,
			'not null' => TRUE,
			'default' => '',
		];


		return $schema;
	}
}
