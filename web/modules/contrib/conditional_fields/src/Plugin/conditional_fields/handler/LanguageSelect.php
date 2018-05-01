<?php

namespace Drupal\conditional_fields\Plugin\conditional_fields\handler;

use Drupal\conditional_fields\ConditionalFieldsHandlerBase;

/**
 * Provides states handler for language select list.
 *
 * @ConditionalFieldsHandler(
 *   id = "states_handler_language_select",
 * )
 */
class LanguageSelect extends ConditionalFieldsHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function statesHandler($field, $field_info, $options) {
    $state = [];
    $select_states = [];

    switch ($options['values_set']) {
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET:
        $state[$options['state']][$options['selector']] = [
          'value' => $this->getWidgetValue($options['value_form']),
        ];
        return $state;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_AND:
        return $state;

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_XOR:
        $select_states[$options['state']][] = 'xor';

      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_REGEX:
        $regex = TRUE;
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT:
      case CONDITIONAL_FIELDS_DEPENDENCY_VALUES_OR:
        foreach ($options['values'] as $value) {
          $select_states[$options['state']][] = [
            $options['selector'] => [
              $options['condition'] => empty($regex) ? [$value] : $options['value'],
            ],
          ];
        }
        break;
    }

    $state = $select_states;

    return $state;
  }

}
