<?php

namespace Drupal\purge\Plugin\Purge\Queue;

use Drupal\Core\DestructableInterface;

/**
 * Describes the queue statistics tracker.
 *
 * Classes implementing this interface provide several numeric counters which
 * represent operational and statistical information related to the queue.
 */
interface StatsTrackerInterface extends DestructableInterface, \Iterator, \Countable {

  /**
   * Array index for ::numberOfItems().
   *
   * @var int
   */
  const NUMBER_OF_ITEMS = 0;

  /**
   * Array index for ::totalProcessing().
   *
   * @var int
   */
  const TOTAL_PROCESSING = 1;

  /**
   * Array index for ::totalSucceeded().
   *
   * @var int
   */
  const TOTAL_SUCCEEDED = 2;

  /**
   * Array index for ::totalFailed().
   *
   * @var int
   */
  const TOTAL_FAILED = 3;

  /**
   * Array index for ::totalNotSupported().
   *
   * @var int
   */
  const TOTAL_NOT_SUPPORTED = 4;

  /**
   * The number of items currently in the queue.
   *
   * @return \Drupal\purge\Plugin\Purge\Queue\NumberOfItemsStatistic
   *   The \Drupal\purge\CounterExplainedCounterInterface compliant statistic.
   */
  public function numberOfItems();

  /**
   * Total number of failed queue items.
   *
   * @return \Drupal\purge\Plugin\Purge\Queue\TotalFailedStatistic
   *   The \Drupal\purge\CounterExplainedCounterInterface compliant statistic.
   */
  public function totalFailed();

  /**
   * Total number of multi-step cache invalidations.
   *
   * @return \Drupal\purge\Plugin\Purge\Queue\TotalProcessingStatistic
   *   The \Drupal\purge\CounterExplainedCounterInterface compliant statistic.
   */
  public function totalProcessing();

  /**
   * Total number of succeeded queue items.
   *
   * @return \Drupal\purge\Plugin\Purge\Queue\TotalSucceededStatistic
   *   The \Drupal\purge\CounterExplainedCounterInterface compliant statistic.
   */
  public function totalSucceeded();

  /**
   * Total number of not supported invalidations.
   *
   * @return \Drupal\purge\Plugin\Purge\Queue\TotalNotSupportedStatistic
   *   The \Drupal\purge\CounterExplainedCounterInterface compliant statistic.
   */
  public function totalNotSupported();

  /**
   * Reset the total counters.
   *
   * This is a shorthand for these calls:
   *  - ::totalFailed()->set(0)
   *  - ::totalProcessing()->set(0)
   *  - ::totalSucceeded()->set(0)
   *  - ::totalNotSupported()->set(0)
   */
  public function resetTotals();

  /**
   * Automatically update the total counters for the given invalidations.
   *
   * @param \Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface[] $invalidations
   *   A non-associative array with invalidation objects regardless of the state
   *   they're in. Their state will determine which counter will be updated.
   */
  public function updateTotals(array $invalidations);

}
