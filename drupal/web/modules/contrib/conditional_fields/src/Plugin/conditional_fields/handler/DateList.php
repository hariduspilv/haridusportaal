<?php

namespace Drupal\conditional_fields\Plugin\conditional_fields\handler;

use Drupal\conditional_fields\ConditionalFieldsHandlerBase;
use Drupal\Core\Datetime\DrupalDateTime;

/**
 * Provides states handler for date lists.
 *
 * @ConditionalFieldsHandler(
 *   id = "states_handler_datetime_datelist",
 * )
 */
class DateList extends ConditionalFieldsHandlerBase {

  /**
   * {@inheritdoc}
   */
  public function statesHandler($field, $field_info, $options) {
    $state = [];
    
    if ($options['values_set'] == CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET) {
      $date_obj = new DrupalDateTime($options['value_form'][0]['value']);
      // Works only for first select list. Need to fix for all possible cases
      $date = $date_obj->format('j');
      // TODO: Support time.
      // Need to check selector and create one more state for it.
      // $time = $date_obj->format('H:i:s');.
      $state[$options['state']][$options['selector']]['value'] = $date;
      return $state;
    }
  }
}
