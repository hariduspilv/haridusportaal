<?php

namespace Drupal\kafka\Queue;

use Drupal\Component\Uuid\UuidInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Site\Settings;
use Drupal\kafka\ClientFactory;

/**
 * Class KafkaQueueFactory is the queue.kafka implementation.
 */
class KafkaQueueFactory {

  /**
   * The kafka.client_factory service.
   *
   * @var \Drupal\kafka\ClientFactory
   */
  protected $clientFactory;

  /**
   * The database service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The settings service.
   *
   * @var \Drupal\Core\Site\Settings
   */
  protected $settings;

  /**
   * KafkaQueue constructor.
   *
   * @param \Drupal\kafka\ClientFactory $clientFactory
   *   The kafka.client_factory service.
   * @param \Drupal\Core\Database\Connection $database
   *   The database service.
   * @param \Drupal\Core\Site\Settings $settings
   *   The settings service.
   * @param \Drupal\Component\Uuid\UuidInterface $uuid
   *   The uuid service.
   */
  public function __construct(
    ClientFactory $clientFactory,
    Connection $database,
    Settings $settings,
    UuidInterface $uuid) {
    $this->clientFactory = $clientFactory;
    $this->database = $database;
    $this->settings = $settings;
    $this->uuid = $uuid;
  }

  /**
   * Return a queue from its name.
   *
   * @param string $name
   *   The queue name.
   *
   * @return \Drupal\Core\Queue\QueueInterface
   *   The queue instance
   */
  public function get($name) {
    $queue = new KafkaQueue($name, $this->database, $this->clientFactory, $this->settings, $this->uuid);
    return $queue;
  }

}
