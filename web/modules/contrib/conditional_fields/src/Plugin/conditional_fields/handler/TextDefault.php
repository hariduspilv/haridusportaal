<?php

namespace Drupal\conditional_fields\Plugin\conditional_fields\handler;

use Drupal\conditional_fields\ConditionalFieldsHandlerBase;

/**
 * Provides states handler for text fields.
 *
 */
class TextDefault extends ConditionalFieldsHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function statesHandler($field, $field_info, $options) {
    $state = [];
    $values_array = !empty($options['values']) ? explode("\r\n", $options['values']) : '';

    // Text fields values are keyed by cardinality, so we have to flatten them.
    // TODO: support multiple values.
    switch ($options['values_set']) {
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET:
        foreach ($options['value_form'] as $value) {
          // fix 0 selector for multiple fields.
          if (!empty($value['value'])) {
            $state[$options['state']][$options['selector']] = ['value' => $value['value']];
          }
        }
        break;
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_AND:
        // TODO: support AND condition.
        break;
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_REGEX:
        $values[$options['condition']] = ['regex' => $options['regex']];
        $state[$options['state']][$options['selector']] = $values;
        break;
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_XOR:
        $state[$options['state']][] = 'xor';
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT:
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_OR:
        if (is_array($values_array)) {
          foreach ($values_array as $value) {
            $input_states[$options['selector']][] = [
              $options['condition'] => $value,
            ];
          }
        }
        else {
          $input_states[$options['selector']] = [
            $options['condition'] => $values_array,
          ];
        }

        $state[$options['state']] = $input_states;
        break;
      default:
        break;
    }
    return $state;
  }
}
