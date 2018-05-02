<?php

namespace Drupal\duration_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\TypedData\DataDefinition;
use Drupal\duration_field\Service\DurationService;

/**
 * Provides the 'duration' field type.
 *
 * @FieldType(
 *   id = "duration",
 *   label = @Translation("Duration"),
 *   default_formatter = "duration_human_display",
 *   default_widget = "duration_widget",
 * )
 */
class DurationField extends FieldItemBase implements FieldItemInterface {

  /**
   * {@inheritdoc}
   */
  public static function defaultFieldSettings() {
    return [
      'granularity' => [
        'year' => TRUE,
        'month' => TRUE,
        'day' => TRUE,
        'hour' => TRUE,
        'minute' => TRUE,
        'second' => TRUE,
      ],
    ] + parent::defaultFieldSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function fieldSettingsForm(array $form, FormStateInterface $form_state) {

    $default_values = [];
    foreach ($this->getSetting('granularity') as $key => $value) {
      if ($value) {
        $default_values[] = $key;
      }
    }

    $element['granularity'] = [
      '#title' => $this->t('Granularity'),
      '#type' => 'checkboxes',
      '#options' => [
        'year' => $this->t('Years'),
        'month' => $this->t('Months'),
        'day' => $this->t('Days'),
        'hour' => $this->t('Hours'),
        'minute' => $this->t('Minutes'),
        'second' => $this->t('Seconds'),
      ],
      '#default_value' => $default_values,
    ];

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {

    return [
      'columns' => [
        'value' => [
          'type' => 'varchar',
          'length' => 255,
          'not null' => FALSE,
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {

    $value = $this->get('value')->getValue();

    return $value === NULL || $value === '';
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties['value'] = DataDefinition::create('string')
      ->setLabel(t('Duration'));

    return $properties;
  }

  /**
   * Sets the value of the field.
   */
  public function setValue($values, $notify = TRUE) {

    if (is_array($values) && isset($values['value']) && is_array($values['value'])) {
      $values['value'] = DurationService::convertValue($values['value']);
    }

    parent::setValue($values, $notify);
  }

}
