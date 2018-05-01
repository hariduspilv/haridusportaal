<?php

namespace Drupal\conditional_fields\Plugin\conditional_fields\handler;

use Drupal\conditional_fields\ConditionalFieldsHandlerBase;

/**
 * Provides states handler for Check boxes/radio buttons.
 *
 * @ConditionalFieldsHandler(
 *   id = "states_handler_options_buttons",
 * )
 */
class OptionsButtons extends ConditionalFieldsHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function statesHandler($field, $field_info, $options) {
    if (array_key_exists('#type', $field) && in_array($field['#type'], ['checkbox', 'checkboxes'])) {
      // Check boxes.
      return $this->checkBoxesHandler($field, $field_info, $options);
    }
    elseif (array_key_exists('#type', $field) && in_array($field['#type'], ['radio', 'radios'])) {
      // Radio.
      return $this->radioHandler($field, $field_info, $options);
    }
    return [];
  }

  /**
   * Return state for radio.
   */
  protected function radioHandler($field, $field_info, $options) {
    $select_states = [];
    $values_array = $options['values'];
    $state = [];
    switch ($options['values_set']) {
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET:
        // TODO: Try to get key_column automatically.
        // like here:
        // @see \Drupal\conditional_fields\Plugin\conditional_fields\handler\Select::widgetCase()
        if (isset($options['value_form'][0]['value'])) {
          $column_key = 'value';
        }
        elseif (isset($options['value_form'][0]['target_id'])) {
          $column_key = 'target_id';
        }
        else {
          break;
        }
        $select_states[$options['selector']] = [$options['condition'] => $options['value_form'][0][$column_key]];
        $state = [$options['state'] => $select_states];
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_AND:
        if (is_array($values_array)) {
          // Will take the first value
          // because there is no possibility to choose more with radio buttons.
          $select_states[$options['selector']] = [$options['condition'] => $values_array[0]];
        }
        else {
          $select_states[$options['selector']] = [$options['condition'] => $values_array];
        }
        $state = [$options['state'] => $select_states];
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_REGEX:
        // This just works.
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_XOR:
        $select_states[$options['state']][] = 'xor';
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT:
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_OR:
        if (is_array($values_array)) {
          foreach ($values_array as $value) {
            $select_states[$options['selector']][] = [
              $options['condition'] => $value,
            ];
          }
        }
        else {
          $select_states[$options['selector']] = [
            $options['condition'] => $values_array,
          ];
        }

        $state = [$options['state'] => $select_states];
        break;
    }
    return $state;
  }

  /**
   * Return state for check boxes.
   */
  protected function checkBoxesHandler($field, $field_info, $options) {
    // Checkboxes are actually different form fields, so the #states property
    // has to include a state for each checkbox.
    $checkboxes_selectors = [];

    switch ($options['values_set']) {
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET:
        $selector = conditional_fields_field_selector($field);
        foreach ($options['value_form'] as $value) {
          $selector_key = str_replace($field['#return_value'], current($value), $selector);
          $checkboxes_selectors[$selector_key] = ['checked' => TRUE];
        }
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_REGEX:
        // We interpret this as: checkboxes whose values match the regular
        // expression should be checked.
        foreach ($field['#options'] as $key => $label) {
          if (preg_match('/' . $options['value']['RegExp'] . '/', $key)) {
            $checkboxes_selectors[conditional_fields_field_selector($field[$key])] = ['checked' => TRUE];
          }
        }
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_AND:
        $values_array = explode("\r\n", $options['values']);
        if (is_array($values_array)) {
          foreach ($values_array as $value) {
            $checkboxes_selectors[conditional_fields_field_selector($field[$value])] = ['checked' => TRUE];
          }
        }
        else {
          $checkboxes_selectors[conditional_fields_field_selector($field[$options['values']])] = ['checked' => TRUE];
        }
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_XOR:
        $checkboxes_selectors[] = 'xor';
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_OR:
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT:
        $values_array = explode("\r\n", $options['values']);
        foreach ($values_array as $value) {
          $checkboxes_selectors[] = [conditional_fields_field_selector($field[$value]) => ['checked' => TRUE]];
        }
        break;
    }

    $state = [$options['state'] => $checkboxes_selectors];

    return $state;
  }

}
