<?php

namespace Drupal\computed_field\Plugin\Field\FieldWidget;

/**
 * Plugin implementation of the 'computed_string_widget' widget.
 *
 * @FieldWidget(
 *   id = "computed_string_widget",
 *   label = @Translation("Computed (visually hidden)"),
 *   field_types = {
 *     "computed_string",
 *     "computed_string_long",
 *   }
 * )
 */

class ComputedStringWidget extends ComputedWidgetBase {
  /**
   * Define how the widget is constructed.
   */
  public function getDefaultValue() {
    return '';
  }
}
