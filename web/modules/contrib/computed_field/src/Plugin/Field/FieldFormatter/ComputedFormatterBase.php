<?php

namespace Drupal\computed_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Base class for cached computed fields formatter.
 */
abstract class ComputedFormatterBase extends FormatterBase {

  /**
   * Include default formatting for cache settings.
   * Implements:
   *    defaultSettings()
   *    settingsForm(...)
   *    settingsSummary()
   */
  use ComputedCacheFormatterTrait;

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode = NULL) {
    $cache_duration = $this->getSetting('cache_duration');
    $cache_unit = $this->getSetting('cache_unit');
    $elements = [];

    foreach ($items as $delta => $item) {
      if ($cache_unit < 0) {
        $elements[$delta] = ['#markup' => $this->prepareValue($item->value)];
      }
      else {
        $elements[$delta] = [
          '#markup' => $this->prepareValue($item->executeCode()),
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
   * @param mixed $value
   *
   * @return mixed
   */
  protected function prepareValue($value) {
    return $value;
  }
}
