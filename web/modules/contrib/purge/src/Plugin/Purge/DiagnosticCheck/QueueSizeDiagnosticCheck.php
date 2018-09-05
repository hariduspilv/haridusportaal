<?php

namespace Drupal\purge\Plugin\Purge\DiagnosticCheck;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckBase;
use Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface;

/**
 * Reports how many items are in the queue and prevents unsustainable volumes.
 *
 * @PurgeDiagnosticCheck(
 *   id = "queue_size",
 *   title = @Translation("Queue size"),
 *   description = @Translation("Reports the size of the queue."),
 *   dependent_queue_plugins = {},
 *   dependent_purger_plugins = {}
 * )
 */
class QueueSizeDiagnosticCheck extends DiagnosticCheckBase implements DiagnosticCheckInterface {

  /**
   * @var \Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface
   */
  protected $purgeQueueStats;

  /**
   * Constructs a \Drupal\purge\Plugin\Purge\DiagnosticCheck\QueueSizeDiagnosticCheck object.
   *
   * @param \Drupal\purge\Plugin\Purge\Queue\StatsTrackerInterface $purge_queue_stats
   *   The queue statistics tracker.
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(StatsTrackerInterface $purge_queue_stats, array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->purgeQueueStats = $purge_queue_stats;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $container->get('purge.queue.stats'),
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritdoc}
   */
  public function run() {
    $this->value = $this->purgeQueueStats->numberOfItems()->getInteger();
    if ($this->value === 0) {
      $this->recommendation = $this->t("Your queue is empty!");
      return SELF::SEVERITY_OK;
    }
    elseif ($this->value < 30000) {
      return SELF::SEVERITY_OK;
    }
    elseif ($this->value < 100000) {
      $this->recommendation = $this->t(
        'Your queue holds more then 30 000 items, which is quite high. Although'
        . ' this may naturally occur in certain configurations there is a risk'
        . ' that a high volume causes your server to crash at some point. High'
        . ' volumes can happen when no processors are clearing your queue,'
        . ' or when queueing outpaces processing. Please have a closer look'
        . ' into nature of your queue volumes, to prevent Purge from shutting'
        . ' down cache invalidation when the threshold of 100 000 items is'
        . ' reached!'
      );
      return SELF::SEVERITY_WARNING;
    }
    else {
      $this->recommendation = $this->t(
        'Your queue exceeded 100 000 items! This volume is extremely high and'
        . ' and not sustainable at all, so Purge has shut down cache'
        . ' invalidation to prevent your servers from actually crashing. This'
        . ' can happen when no processors are clearing your queue, or when'
        . ' queueing outpaces processing. Please first solve the'
        . ' structural nature of the issue by adding processing power or'
        . ' reducing your queue loads. Empty the queue to unblock your system.'
      );
      return SELF::SEVERITY_ERROR;
    }
  }

}
