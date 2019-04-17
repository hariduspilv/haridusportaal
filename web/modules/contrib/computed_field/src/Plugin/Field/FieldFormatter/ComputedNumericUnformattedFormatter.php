<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

/**
 * Plugin implementation of the 'computed_number_unformatted' formatter.
 *
 * @FieldFormatter(
 *   id = "computed_number_unformatted",
 *   label = @Translation("Unformatted"),
 *   field_types = {
 *     "computed_integer",
 *     "computed_decimal",
 *     "computed_float"
 *   }
 * )
 */
class ComputedNumericUnformattedFormatter extends ComputedFormatterBase {
  // Everything is in the base class. This class provides the annotations only.
}
