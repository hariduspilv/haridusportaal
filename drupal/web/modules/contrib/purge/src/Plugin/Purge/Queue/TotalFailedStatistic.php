<?php

namespace Drupal\purge\Plugin\Purge\Queue;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\purge\Counter\Counter;
use Drupal\purge\Counter\ExplainedCounterInterface;

/**
 * Total number of failed queue items.
 */
class TotalFailedStatistic extends Counter implements ExplainedCounterInterface {
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
    return 'total_failed';
  }

  /**
   * {@inheritdoc}
   */
  public function getTitle() {
    return $this->t(
      'Total number of failed queue items.'
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t(
      'Whenever a purger returns a queue item as failed, we track these failures in this statistic. However, failing items fail for various reasons and are usually expected to still succeed in the future. The total number of failures happening over time, should be seen as indicator whether a few incidents took place versus sky-rocketing failure rates because of some structural problem.'
    );
  }

}
