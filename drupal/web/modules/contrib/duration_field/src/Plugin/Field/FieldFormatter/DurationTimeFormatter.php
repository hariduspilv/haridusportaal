<?php

namespace Drupal\duration_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Provides a formatter for the duration field type.
 *
 * @FieldFormatter(
 *   id = "duration_time_display",
 *   label = @Translation("Time Format"),
 *   field_types = {
 *     "duration"
 *   }
 * )
 */
class DurationTimeFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {

    $summary = [];

    $summary[] = t('Displays the duration in the format @format', ['@format' => $this->getDisplayFormat()]);

    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $element = [];

    $granularity = $this->getFieldSetting('granularity');

    foreach ($items as $delta => $item) {
      $duration = new \DateInterval($item->value);

      $output = [];
      if ($granularity['year'] || $granularity['month'] || $granularity['day']) {
        $output[] = $duration->format('%y') . '-' . $duration->format('%m') . '-' . $duration->format('%d');
      }

      if ($granularity['hour'] || $granularity['minute'] || $granularity['second']) {
        $output[] = $duration->format('%h') . ':' . $duration->format('%I') . ':' . $duration->format('%S');
      }

      // Render each element as markup.
      $element[$delta] = [
        '#markup' => implode(' ', $output),
      ];
    }

    return $element;
  }

  /**
   * Generate the format that will be shown to users in the settings overview.
   */
  protected function getDisplayFormat() {

    $granularity = $this->getFieldSetting('granularity');

    $parts = [];
    if ($granularity['year'] || $granularity['month'] || $granularity['day']) {
      $parts[] = 'YY-MM-DD';
    }

    if ($granularity['hour'] || $granularity['minute'] || $granularity['second']) {
      $parts[] = 'HH:MM:SS';
    }

    return implode(' ', $parts);
  }

}
