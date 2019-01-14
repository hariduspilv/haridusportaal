<?php

namespace Drupal\htm_custom_video_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'custom_video_field_type' field type.
 *
 * @FieldType(
 *   id = "custom_video_field_type",
 *   label = @Translation("Custom video field type"),
 *   description = @Translation("My Field Type"),
 *   default_widget = "custom_video_widget_type",
 *   default_formatter = "custom_video_formatter_type"
 * )
 */
class CustomVideoFieldType extends FieldItemBase {

	/**
	 * Definitions of the contained properties.
	 *
	 * @var array
	 */
	public static $propertyDefinitions;

	/**
	 * {@inheritdoc}
	 */
	public static function schema(FieldStorageDefinitionInterface $field_definition) {
		return array(
			'columns' => array(
				'input' => array(
					'description' => 'Video URL.',
					'type' => 'varchar',
					'length' => 1024,
					'not null' => FALSE,
				),
				'video_domain' => array(
					'description' => 'Video Domain.',
					'type' => 'varchar',
					'length' => 100,
					'not null' => FALSE,
				),
				'video_description' => array(
					'description' => 'Video description.',
					'type' => 'varchar',
					'length' => 255,
					'not null' => FALSE,
				),
				'video_id' => array(
					'description' => 'Video ID.',
					'type' => 'varchar',
					'length' => 20,
					'not null' => FALSE,
				),
			),
		);
	}

	/**
	 * {@inheritdoc}
	 */
	public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
		$properties['input'] = DataDefinition::create('string')
			->setLabel(t('Video url'));

		$properties['video_domain'] = DataDefinition::create('string')
			->setLabel(t('Video domain'));

		$properties['video_description'] = DataDefinition::create('string')
			->setLabel(t('Video description'));

		$properties['video_id'] = DataDefinition::create('string')
			->setLabel(t('Video id'));

		return $properties;
	}

	/**
	 * {@inheritdoc}
	 */
	public function isEmpty() {
		$value = $this->get('input')->getValue();
		return $value === NULL || $value === '';
	}

	/**
	 * {@inheritdoc}
	 */
	public static function mainPropertyName() {
		return 'input';
	}

}
