<?php

namespace Drupal\kafka\Queue;

use Drupal\Core\Database\Connection;
use Drupal\Core\Database\Query\Merge;

/**
 * Class KafkaItem is a lightweight object for items exchanged with Kafka.
 *
 * It is split in two parts:
 * - the object proper, matching the in-Kafka payload: item_id, created, data.
 * - the object metadata, relating it to Kafka and the Drupal queue: queue,
 *   partition, offset.
 */
class KafkaItem {
  const TABLE = 'kafka_item';

  /**
   * The same as what what passed into createItem().
   *
   * @see \Drupal\Core\Queue\QueueInterface::claimItem()
   *
   * @var mixed
   */
  public $data;

  // @codingStandardsIgnoreStart
  /**
   * The unique ID returned from createItem().
   *
   * The non-camelCase name is required by QueueInterface.
   *
   * @see \Drupal\Core\Queue\QueueInterface::claimItem()
   *
   * @var string
   */
  public $item_id;
  // @codingStandardsIgnoreEnd

  /**
   * Timestamp when the item was put into the queue.
   *
   * @see \Drupal\Core\Queue\QueueInterface::claimItem()
   *
   * @var int
   */
  public $created;

  /**
   * The offset of the item in the partition from which it was fetched, if any.
   *
   * @var int
   */
  public $offset;

  /**
   * The index of the partition from which the item was fetched, if any.
   *
   * @var int
   */
  public $partition;

  /**
   * The name of the queue/topic from which the item was fetched, if any.
   *
   * @var string
   */
  public $queue;

  /**
   * The expiration timestamp for a claimed item, if any.
   *
   * @var int
   */
  public $expires;

  /**
   * KafkaItem constructor.
   *
   * @param mixed $data
   *   The payload. Must be serializable.
   * @param null|string $uuid
   *   Optional, but recommended for efficiency: the unique id to the item.
   * @param int|null $created
   *   Optional: the item submission time.
   */
  public function __construct($data, $uuid = NULL, $created = NULL) {
    // Items can be created in a loop, so we cannot rely on REQUEST_TIME.
    $this->created = $created ?: time();

    $this->data = $data;
    $this->item_id = $uuid ?: \Drupal::service('uuid')->generate();

    $this->expires = 0;
    $this->offset = NULL;
    $this->partition = NULL;
    $this->queue = NULL;
  }

  /**
   * Factory method.
   *
   * @param string $serialized
   *   The serialized representation of the item.
   *
   * @return static
   */
  public static function fromString($serialized) {
    $array = unserialize($serialized);
    return new static($array['data'], $array['item_id'], $array['created']);
  }

  /**
   * Represents the item own properties, regardless of its queue/topic origin.
   *
   * @return string
   *   The object content, serialized.
   */
  public function payloadString() {
    // Order the keys for better readability of the serialized format, making
    // it usable without the class if needed.
    $array = [
      'item_id' => $this->item_id,
      'created' => $this->created,
      'data' => $this->data,
    ];

    return serialize($array);
  }

  /**
   * Store a fully configured item to the DB.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection to use.
   */
  public function persist(Connection $database) {
    if (!isset($this->queue)
      || !isset($this->partition)
      || !isset($this->offset)
      || !isset($this->expires)) {
      throw new \RuntimeException('Items may only be saved within a queue');
    }

    $q = $database->merge(static::TABLE)
      ->key('item_id', $this->item_id)
      ->fields([
        'item_id' => $this->item_id,
        'created' => $this->created,
        'data' => $this->data,

        'queue' => $this->queue,
        'partition_id' => $this->partition,
        'offset' => $this->offset,
        'expires' => $this->expires,
      ]);
    $q->execute();
  }

  /**
   * Release a claimed item in the DB.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection to use.
   */
  public function release(Connection $database) {
    if (!isset($this->queue)
      || !isset($this->partition)
      || !isset($this->offset)
      || !isset($this->expires)) {
      throw new \RuntimeException('Items may only be released within a queue');
    }

    $this->expires = 0;
    $result = $database->merge(static::TABLE)
      ->key('item_id', $this->item_id)
      ->fields([
        'expires' => 0,
      ])
      ->execute();

    if ($result === Merge::STATUS_INSERT) {
      $this->volatilize($database);
    }
  }

  /**
   * Remove a fully configured item from the DB, making it volatile again.
   *
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection to use.
   */
  public function volatilize(Connection $database) {
    $database->delete(static::TABLE)
      ->condition('item_id', $this->item_id)
      ->execute();
  }

}
