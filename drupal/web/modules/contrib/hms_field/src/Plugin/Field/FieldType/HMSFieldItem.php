<?php

/**
 * @file
 * Contains \Drupal\hms_field\Plugin\Field\FieldType\HMSFieldItem.
 */

namespace Drupal\hms_field\Plugin\Field\FieldType;

use Drupal\Component\Utility\Random;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslationWrapper;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'hms' field type.
 *
 * @FieldType(
 *   id = "hms",
 *   label = @Translation("Hours Minutes and Seconds"),
 *   description = @Translation("Store Hours, Minutes or Seconds as an integer."),
 *   default_widget = "hms_default",
 *   default_formatter = "hms_default_formatter"
 * )
 */
class HMSFieldItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    // Prevent early t() calls by using the TranslationWrapper.
    $properties['value'] = DataDefinition::create('integer')
      ->setLabel(new TranslationWrapper('HMS integer value'));

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $schema = array(
      'columns' => array(
        'value' => array(
          'type' => 'int',
          'unsigned' => FALSE,
          'not null' => FALSE,
        ),
      ),
    );
    return $schema;
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    $value = $this->get('value')->getValue();
    return $value === NULL || $value === '';
  }
}
