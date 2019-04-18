<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\Plugin\Field\FieldFormatter\IntegerFormatter;

/**
 * Plugin implementation of the 'Default' formatter for computed integers.
 *
 * @FieldFormatter(
 *   id = "computed_integer",
 *   label = @Translation("Default"),
 *   field_types = {
 *     "computed_integer"
 *   }
 * )
 */
class ComputedIntegerFormatter extends IntegerFormatter {
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
