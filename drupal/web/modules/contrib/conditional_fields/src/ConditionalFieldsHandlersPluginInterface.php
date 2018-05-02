<?php

namespace Drupal\conditional_fields;

/**
 * Defines the required interface for all conditional field's handler plugins.
 */
interface ConditionalFieldsHandlersPluginInterface {

  /**
   * Executes states handler according to conditional fields settings.
   */
  public function statesHandler($field, $field_info, $options);

  /**
   * Get values from widget settings for plugin.
   *
   * @param array $value_form
   *   Dependency options.
   *
   * @return mixed
   *   Values for triggering events.
   */
  public function getWidgetValue(array $value_form);

}
