<?php

namespace Drupal\purge\Plugin\Purge\Queue;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\purge\Counter\Counter;
use Drupal\purge\Counter\ExplainedCounterInterface;

/**
 * The number of items currently in the queue.
 *
 * @see \Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface::numberOfItems()
 */
class NumberOfItemsStatistic extends Counter implements ExplainedCounterInterface {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function getId() {
    return 'number_of_items';
  }

  /**
   * {@inheritdoc}
   */
  public function getTitle() {
    return $this->t(
      'The number of items currently in the queue.'
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t(
      'This counter is not a true statistic, but instead a maintained copy of the number of items in the queue. This exists to prevent expensive queue lookups in the underlying queue backend and should at all times be the exact number of items currently in the queue.'
    );
  }

}
