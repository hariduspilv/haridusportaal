<?php

namespace Drupal\duration_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Provides a formatter for the duration field type.
 *
 * @FieldFormatter(
 *   id = "duration_raw_value_display",
 *   label = @Translation("Raw Value"),
 *   field_types = {
 *     "duration"
 *   }
 * )
 */
class DurationRawValueFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {

    $summary = [];

    $summary[] = $this->t('Displays the value in <a href=":link">duration format</a>', [':link' => 'http://en.wikipedia.org/wiki/Iso8601#Durations']);

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {

    $element = [];

    foreach ($items as $delta => $item) {
      $element[$delta] = [
        '#markup' => $item->value,
      ];
    }

    return $element;
  }

}
