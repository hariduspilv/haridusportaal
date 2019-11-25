<?php

namespace Drupal\purge\Plugin\Purge\Queue;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\purge\Counter\Counter;
use Drupal\purge\Counter\ExplainedCounterInterface;

/**
 * Total number of multi-step cache invalidations.
 */
class TotalProcessingStatistic extends Counter implements ExplainedCounterInterface {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  public function getId() {
    return 'total_processing';
  }

  /**
   * {@inheritdoc}
   */
  public function getTitle() {
    return $this->t(
      'Total number of multi-step cache invalidations.'
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t(
      'This counter keeps track of queue items that require multi-step execution to complete. This is most common for CDNs that require later API calls in the future to find out whether the requested cache invalidation succeeded or failed. These items cycle back to the queue until the purger marks them as succeeded or failed.'
    );
  }

}
