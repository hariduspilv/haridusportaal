<?php

namespace Drupal\purge\Tests\Queue;

/**
 * Tests \Drupal\purge\Plugin\Purge\Queue\DatabaseQueue.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Queue\QueueInterface
 */
class DatabaseQueueTest extends PluginTestBase {

  /**
   * The plugin ID of the queue plugin being tested.
   *
   * @var string
   */
  protected $pluginId = 'database';

  /**
   * {@inheritdoc}
   */
  protected function setUpQueuePlugin() {
    // Override parent::setUpQueuePlugin() to always recreate the instance, else
    // the tests fail: "failed to instantiate user-supplied statement class".
    $this->queue = $this->pluginManagerPurgeQueue->createInstance($this->pluginId);
    $this->assertNull($this->queue->createQueue());
  }

}
