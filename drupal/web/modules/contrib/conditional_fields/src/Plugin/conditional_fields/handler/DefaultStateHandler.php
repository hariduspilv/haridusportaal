<?php

namespace Drupal\conditional_fields\Plugin\conditional_fields\handler;

use Drupal\conditional_fields\ConditionalFieldsHandlerBase;
use Drupal\Component\Utility\Unicode;

/**
 * Provides states handler for text fields.
 *
 * @ConditionalFieldsHandler(
 *   id = "states_handler_default_state",
 * )
 */
class DefaultStateHandler extends ConditionalFieldsHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function statesHandler($field, $field_info, $options) {
    // Build the values that trigger the dependency.
    $values = [];
    $values_set = $options['values_set'];

    switch ($values_set) {
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET:
        $values[$options['condition']] = $options['value_form'];
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_REGEX:
        $values[$options['condition']] = ['regex' => $options['regex']];
        break;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_AND:
        $values_array = explode("\r\n", $options['values']);
        $values[$options['condition']] = count($values_array) == 1 ? $values_array[0] : $values_array;
        break;

      default:
        if ($options['values_set'] == CONDITIONAL_FIELDS_DEPENDENCY_VALUES_XOR) {
          // XOR behaves like OR with added 'xor' element.
          $values[] = 'xor';
        }
        elseif ($options['values_set'] == CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT) {
          // NOT behaves like OR with switched state.
          $options['state'] = strpos($options['state'], '!') === 0 ? Unicode::substr($options['state'], 1) : '!' . $options['state'];
        }

        // OR, NOT and XOR conditions are obtained with a nested array.
        $values_array = explode("\r\n", $options['values']);
        if (is_array($values_array)) {
          foreach ($values_array as $value) {
            $values[] = ['value' => $value];
          }
        }
        else {
          $values = $options['values'];
        }
        break;
    }

    $state = [$options['state'] => [$options['selector'] => $values]];

    return $state;
  }

}
