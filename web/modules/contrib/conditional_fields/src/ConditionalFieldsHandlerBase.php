<?php

namespace Drupal\conditional_fields;

/**
 * Defines a base handler implementation that most handlers plugins will extend.
 */
abstract class ConditionalFieldsHandlerBase implements ConditionalFieldsHandlersPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function getWidgetValue(array $value_form) {
    return $value_form[0]['value'];
  }

}
