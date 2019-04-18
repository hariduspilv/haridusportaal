<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'computed_decimal' field type.
 *
 * @FieldType(
 *   id = "computed_decimal",
 *   label = @Translation("Computed (decimal)"),
 *   description = @Translation("This field defines a decimal field whose value is computed by PHP-Code"),
 *   category = @Translation("Computed"),
 *   default_widget = "computed_number_widget",
 *   default_formatter = "computed_decimal",
 *   permission = "administer computed field",
 * )
 */
class ComputedDecimalItem extends ComputedFieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function defaultStorageSettings() {
    return [
      'precision' => 10,
      'scale' => 2,
    ] + parent::defaultStorageSettings();
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    // Prevent early t() calls by using the TranslatableMarkup.
    $properties['value'] = DataDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Decimal value'))
      ->setRequired(TRUE);

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $settings = $field_definition->getSettings();
    $schema = [
      'columns' => [
        'value' => [
          'type' => 'numeric',
          'precision' => $settings['precision'],
          'scale' => $settings['scale'],
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
    $values['value'] = 0;
    return $values;
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {
    $element = parent::fieldSettingsForm($form, $form_state);
    $settings = $this->getSettings();

    $element['code']['#title'] = $this->t('Code (PHP) to compute the <em>decimal</em> value');
    $element['code']['#description'] .= '<p>'
        . t('The value will be rounded to @scale decimals.', ['@scale' => $settings['scale']])
        . '</p>';

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function storageSettingsForm(array &$form, FormStateInterface $form_state, $has_data) {
    $element = [];
    $settings = $this->getSettings();

    $precision_range = range(10, 32);
    $element['precision'] = [
      '#type' => 'select',
      '#title' => t('Precision'),
      '#options' => array_combine($precision_range, $precision_range),
      '#default_value' => $settings['precision'],
      '#description' => t('The total number of digits to store in the database, including those to the right of the decimal.'),
      '#disabled' => $has_data,
    ];
    $scale_range = range(0, 10);
    $element['scale'] = [
      '#type' => 'select',
      '#title' => t('Scale', [], ['context' => 'decimal places']),
      '#options' => array_combine($scale_range, $scale_range),
      '#default_value' => $settings['scale'],
      '#description' => t('The number of digits to the right of the decimal.'),
      '#disabled' => $has_data,
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   *
   * @return float
   *   The floating point number.
   */
  public function executeCode() {
    return round(parent::executeCode(), $this->getSettings()['scale']);
  }

}
