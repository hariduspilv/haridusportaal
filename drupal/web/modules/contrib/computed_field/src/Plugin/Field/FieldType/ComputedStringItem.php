<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'computed_string' field type.
 *
 * @FieldType(
 *   id = "computed_string",
 *   label = @Translation("Computed (text)"),
 *   description = @Translation("This field defines a text field whose value is computed by PHP-Code"),
 *   category = @Translation("Computed"),
 *   default_widget = "computed_string_widget",
 *   default_formatter = "computed_string"
 * )
 */
class ComputedStringItem extends ComputedStringItemBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultStorageSettings() {
    return [
      'max_length' => 255,
      'is_ascii' => FALSE,
    ] + parent::defaultStorageSettings();
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $settings = $field_definition->getSettings();
    $schema = [
      'columns' => [
        'value' => [
          'type' => $settings['is_ascii'] === TRUE ? 'varchar_ascii' : 'varchar',
          'length' => (int) $settings['max_length'],
          'binary' => $settings['case_sensitive'],
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
    $settings = $this->getSettings();

    $element['code']['#description'] .= '<p>'
      . t('The value will be truncated to @max_length characters.', ['@max_length' => $settings['max_length']])
      . '</p>';

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function storageSettingsForm(array &$form, FormStateInterface $form_state, $has_data) {
    $settings = $this->getSettings();
    $element = [];

    $element['max_length'] = [
      '#type' => 'number',
      '#title' => t('Maximum length'),
      '#default_value' => $settings['max_length'],
      '#required' => TRUE,
      '#description' => t('The maximum length of the field in characters.'),
      '#min' => 1,
      '#disabled' => $has_data,
    ];

    return $element;
  }

  /**
   * This function does the computation of the field value.
   *
   * @return string
   *   The string.
   */
  public function executeCode() {
    return mb_substr(parent::executeCode(), 0, $this->getSettings()['max_length'] - 1);
  }

}
