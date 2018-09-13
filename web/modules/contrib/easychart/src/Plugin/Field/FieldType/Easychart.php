<?php

/**
 * @file
 * Contains \Drupal\easychart\Plugin\Field\FieldType\EasychartItem.
 */

namespace Drupal\easychart\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the Easychart field type.
 *
 * @FieldType(
 *   id = "easychart",
 *   label = @Translation("Easy chart"),
 *   category = @Translation("Chart"),
 *   default_widget = "easychart_default",
 *   default_formatter = "easychart_default"
 * )
 */
class Easychart extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties = [];

    $properties['csv'] = DataDefinition::create('string')
      ->setLabel(t('CSV'));
    $properties['csv_url'] = DataDefinition::create('string')
      ->setLabel(t('CSV URL'));
    $properties['config'] = DataDefinition::create('string')
      ->setLabel(t('Config'));

    return $properties;
  }

 /**
  * {@inheritdoc}
  */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    return array(
      'columns' => array(
        'csv' => array(
          'description' => 'CSV',
          'type' => 'text',
          'size' => 'big',
          'not null' => FALSE,
        ),
        'csv_url' => array(
          'description' => 'CSV URL',
          'type' => 'text',
          'size' => 'medium',
          'not null' => FALSE,
        ),
        'config' => array(
          'description' => 'Configuration',
          'type' => 'text',
          'size' => 'big',
          'not null' => FALSE,
        ),
      ),
    );
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    $value = $this->get('csv')->getValue();
    return $value === NULL || $value === '';
  }

}
