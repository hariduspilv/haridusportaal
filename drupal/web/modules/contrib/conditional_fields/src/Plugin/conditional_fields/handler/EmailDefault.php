<?php

namespace Drupal\conditional_fields\Plugin\conditional_fields\handler;

use Drupal\conditional_fields\ConditionalFieldsHandlerBase;

/**
 * Provides states handler for emails.
 *
 * @ConditionalFieldsHandler(
 *   id = "states_handler_email_default",
 * )
 */
class EmailDefault extends ConditionalFieldsHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function statesHandler($field, $field_info, $options) {
    $state = [];
    $values_array = $this->getConditionValues( $options );

    // Email fields values are keyed by cardinality, so we have to flatten them.
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
        $values[$options['condition']] = ['xor' => $values_array];
        $state[$options['state']][$options['selector']] = $values;
        break;
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT:
        $options['state'] = '!' . $options['state'];
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_OR:
        if (! empty($values_array)) {
          foreach ($values_array as $value) {
            $input_states[$options['selector']][] = ['value' => $value];
          }
        }
        else {
          $input_states[$options['selector']] = [
            $options['condition'] => $values_array,
          ];
        }
        
        $state[$options['state']][] = $input_states;
        break;
      default:
        break;
    }
    return $state;
  }
}
