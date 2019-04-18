<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;

/**
 * Additional formatter trait for computed numeric fields.
 *
 * This trait provides the "view" formatter (prefix, suffix, thousands separator)
 *
 * @class NumericFormatterBase;
 */

trait ComputedNumericFormatterTrait {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $cache_duration = $this->getSetting('cache_duration');
    $cache_unit = $this->getSetting('cache_unit');
    $elements = [];
    $settings = $this->getFieldSettings();

    foreach ($items as $delta => $item) {
      if ($cache_unit < 0) {
        $value = $item->value;
      } else {
        $value = $item->executeCode();
      }
      if (is_null($value)) continue;
      $output = $this->numberFormat($value);

      // Account for prefix and suffix.
      if ($this->getSetting('prefix_suffix')) {
        $prefixes = isset($settings['prefix']) ? array_map(['Drupal\Core\Field\FieldFilteredMarkup', 'create'], explode('|', $settings['prefix'])) : [''];
        $suffixes = isset($settings['suffix']) ? array_map(['Drupal\Core\Field\FieldFilteredMarkup', 'create'], explode('|', $settings['suffix'])) : [''];
        $prefix = (count($prefixes) > 1) ? $this->formatPlural($item->value, $prefixes[0], $prefixes[1]) : $prefixes[0];
        $suffix = (count($suffixes) > 1) ? $this->formatPlural($item->value, $suffixes[0], $suffixes[1]) : $suffixes[0];
        $output = $prefix . $output . $suffix;
      }
      // Output the raw value in a content attribute if the text of the HTML
      // element differs from the raw value (for example when a prefix is used).
      if (isset($item->_attributes) && $item->value != $output) {
        $item->_attributes += ['content' => $item->value];
      }

      $elements[$delta] = ['#markup' => $output];
      if ($cache_unit >= 0) {
        $elements[$delta] += [
          '#cache' => [
            'keys' => [
              $items->getEntity()->getEntityTypeId(),
              $items->getEntity()->bundle(),
              $this->viewMode,
            ],
            'max-age' => $cache_duration * $cache_unit,
          ]
        ];
      }
    }

    return $elements;
  }

}