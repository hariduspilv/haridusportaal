<?php

namespace Drupal\purge\Plugin\Purge\Queue;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\purge\Counter\Counter;
use Drupal\purge\Counter\ExplainedCounterInterface;

/**
 * Total number of not supported invalidations.
 */
class totalNotSupportedStatistic extends Counter implements ExplainedCounterInterface {
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
    return 'total_not_supported';
  }

  /**
   * {@inheritdoc}
   */
  public function getTitle() {
    return $this->t(
      'Total number of unsupported invalidations.'
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return $this->t(
        'Queue items can be unsupported at any point in time when no configured'
      . ' purgers supported the type of cache invalidation requested. For'
      . ' example, when your purger only supports "tag" but a "url" item ended'
      . ' up in the queue and got offered to the purger, this statistic is'
      . ' updated. However, it is totally possible that this same queue item'
      . ' later succeeds because a new version of the purger now suddenly'
      . ' supports this type of cache invalidation.'
    );
  }

}
