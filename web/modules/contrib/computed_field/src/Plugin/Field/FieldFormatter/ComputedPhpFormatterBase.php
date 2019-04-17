<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Base class for own php-formatter
 */
abstract class ComputedPhpFormatterBase extends ComputedStringFormatter {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode = NULL) {
    $cache_duration = $this->getSetting('cache_duration');
    $cache_unit = $this->getSetting('cache_unit');
    $elements = [];

    foreach ($items as $delta => $item) {
      if ($cache_unit < 0) {
        $elements[$delta] = [
          '#markup' => $this->prepareValue($this->formatItem($item->value, $item, $delta, $langcode))
        ];
      }
      else {
        $value = $this->prepareValue($item->executeCode());
        $elements[$delta] = [
          '#markup' => $this->prepareValue($this->formatItem($item->executeCode(), $item, $delta, $langcode)),
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

  /**
   * Do something with the value before displaying it.
   *
   * @param mixed $value
   *   The (computed) value of the item.
   * @param \Drupal\Core\Field\FieldItemInterface $item
   *   The item to format for output
   * @param int $delta
   *   The delta value (index) of the item in case of multiple items
   * @param string $langcode
   *   The language code
   * @return mixed
   */
  public function formatItem($value, FieldItemInterface $item, $delta = 0, $langcode = NULL) {
    return $value;
  }
}
