<?php

namespace Drupal\purge\Plugin\Purge\Queue;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\purge\Counter\Counter;
use Drupal\purge\Counter\ExplainedCounterInterface;

/**
 * Total number of succeeded queue items.
 */
class TotalSucceededStatistic extends Counter implements ExplainedCounterInterface {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function __construct($value = 0.0) {
    parent::__construct($value);
    $this->disableDecrement();
  }

  /**
   * {@inheritdoc}
   */
  public function getId() {
    return 'total_succeeded';
  }

  /**
   * {@inheritdoc}
   */
  public function getTitle() {
    return $this->t(
      'Total number of succeeded queue items.'
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t(
      'When queue items are successfully processed, they are deleted from the queue to make space for new items. This statistic represents all of the successful cache invalidations that happened over time.'
    );
  }

}
