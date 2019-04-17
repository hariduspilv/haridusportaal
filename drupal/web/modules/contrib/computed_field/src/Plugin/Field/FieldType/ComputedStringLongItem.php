<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'computed_string' field type.
 *
 * @FieldType(
 *   id = "computed_string_long",
 *   label = @Translation("Computed (text, long)"),
 *   description = @Translation("This field defines a long text field whose value is computed by PHP-Code"),
 *   category = @Translation("Computed"),
 *   default_widget = "computed_string_widget",
 *   default_formatter = "computed_string"
 * )
 */
class ComputedStringLongItem extends ComputedStringItemBase {

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $settings = $field_definition->getSettings();
    $schema = [
      'columns' => [
        'value' => [
          'type' => $settings['case_sensitive'] ? 'blob' : 'text',
          'size' => 'big',
        ],
      ],
    ];

    return $schema;
  }

  /**
   * {@inheritdoc}
   *
   * @todo Add useful code.
   */
  public static function generateSampleValue(FieldDefinitionInterface $field_definition) {
    $values['value'] = '';
    return $values;
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {
    $element = parent::fieldSettingsForm($form, $form_state);
    $element['code']['#title'] = $this->t('Code (PHP) to compute the <em>long text</em> value');
    return $element;
  }

}
