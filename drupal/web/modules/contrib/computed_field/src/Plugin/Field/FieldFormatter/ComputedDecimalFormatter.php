<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\Plugin\Field\FieldFormatter\DecimalFormatter;

/**
 * Plugin implementation of the 'Default' formatter for computed decimals.
 *
 * @FieldFormatter(
 *   id = "computed_decimal",
 *   label = @Translation("Default"),
 *   field_types = {
 *     "computed_decimal",
 *     "computed_float"
 *   }
 * )
 */
class ComputedDecimalFormatter extends DecimalFormatter {
  /**
   * Include default formatting for cache settings.
   * Implements:
   *    defaultSettings()
   *    settingsForm(...)
   *    settingsSummary()
   */
  use ComputedCacheFormatterTrait;

  /**
   * Include formatting for numeric fields.
   * Implements:
   *    viewElements(...)
   */
  use ComputedNumericFormatterTrait;

}
