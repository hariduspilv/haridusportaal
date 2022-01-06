<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Processor\ProcessorInterface;

/**
 * Processor that filters out context keys.
 */
class ContextKeyFilterProcessor implements ProcessorInterface {

  /**
   * The context keys to filter.
   *
   * @var string[]
   */
  protected array $contextKeys;

  /**
   * ContextKeyFilterProcessor constructor.
   *
   * @param string[] $contextKeys
   *   The context keys to skip.
   */
  public function __construct(array $contextKeys = []) {
    $this->contextKeys = $contextKeys;
  }

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record): array {
    foreach ($this->contextKeys as $key) {
      if (isset($record['context'][$key])) {
        unset($record['context'][$key]);
      }
    }

    return $record;
  }

}
