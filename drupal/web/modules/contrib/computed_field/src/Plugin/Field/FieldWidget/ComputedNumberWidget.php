<?php

namespace Drupal\computed_field\Plugin\Field\FieldWidget;

/**
 * Plugin implementation of the 'computed_number_widget' widget.
 *
 * @FieldWidget(
 *   id = "computed_number_widget",
 *   label = @Translation("Computed (visually hidden)"),
 *   field_types = {
 *     "computed_integer",
 *     "computed_decimal",
 *     "computed_float"
 *   }
 * )
 */

class ComputedNumberWidget extends ComputedWidgetBase {
  /**
   * Define how the widget is constructed.
   */
  public function getDefaultValue() {
    return 0;
  }
}
