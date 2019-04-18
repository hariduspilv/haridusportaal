<?php

namespace Drupal\computed_field\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Base class for computed field's dummy widgets.
 *
 */

abstract class ComputedWidgetBase extends WidgetBase {
  public $default_value = '';

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = [];
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('This field should be in the visible area if it was added to the field list after content has been created for this bundle. You can save all those contents to apply the computed value and then safely move this field to the disabled area.');
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $element = [];

    $element['value'] = $element + [
        '#title' => $this->fieldDefinition->getName(),
        '#type' => 'hidden',
        '#default_value' => $this->getDefaultValue(),
        '#disabled' => TRUE,
        '#description' => $this->t('Normally this field should not be shown!'),
      ];
    return $element;
  }


}
