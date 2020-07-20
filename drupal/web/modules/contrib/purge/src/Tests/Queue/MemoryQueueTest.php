<?php

namespace Drupal\purge\Tests\Queue;

/**
 * Tests \Drupal\purge\Plugin\Purge\Queue\MemoryQueue.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Queue\QueueInterface
 */
class MemoryQueueTest extends PluginTestBase {

  /**
   * The plugin ID of the queue plugin being tested.
   *
   * @var string
   */
  protected $pluginId = 'memory';

}
