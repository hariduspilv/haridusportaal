<?php

namespace Drupal\computed_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'computed_float' field type.
 *
 * @FieldType(
 *   id = "computed_float",
 *   label = @Translation("Computed (float)"),
 *   description = @Translation("This field defines a float field whose value is computed by PHP-Code"),
 *   category = @Translation("Computed"),
 *   default_widget = "computed_number_widget",
 *   default_formatter = "computed_decimal"
 * )
 */
class ComputedFloatItem extends ComputedFieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    // Prevent early t() calls by using the TranslatableMarkup.
    $properties['value'] = DataDefinition::create('float')
      ->setLabel(new TranslatableMarkup('Float'))
      ->setRequired(TRUE);

    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    return [
      'columns' => [
        'value' => [
          'type' => 'float',
        ],
      ],
    ];
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

    $element['code']['#title'] = $this->t('Code (PHP) to compute the <em>float</em> value');

    return $element;
  }

}
