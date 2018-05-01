<?php

namespace Drupal\kafka\Queue;

use Drupal\Component\Uuid\UuidInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Queue\QueueGarbageCollectionInterface;
use Drupal\Core\Queue\QueueInterface;
use Drupal\Core\Site\Settings;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\kafka\ClientFactory;

/**
 * Class KafkaQueue is a Drupal Queue backend.
 *
 * Queues match Kafka topics and have a DB representation:
 * - queues can be marked deleted: this does not affect Kafka
 * - queues can only be used is they have been created and are not deleted.
 * - queues are removed from Kafka and the DB on garbage collection.
 */
class KafkaQueue implements QueueInterface, QueueGarbageCollectionInterface {
  const TABLE = 'kafka_queue';

  /**
   * The kafka.client_factory service.
   *
   * @var \Drupal\kafka\ClientFactory
   */
  protected $clientFactory;

  /**
   * A configured, subscribed consumer instance, or null.
   *
   * @var \RdKafka\KafkaConsumer
   */
  protected $consumer;

  /**
   * The consumer topic for the queue.
   *
   * @var \RdKafka\ConsumerTopic
   */
  protected $consumerTopic;

  /**
   * Is the queue deleted ?
   *
   * @var bool|null
   */
  protected $isDeleted = NULL;

  /**
   * Is the queue created in the DB ?
   *
   * @var bool|null
   */
  protected $isExisting = NULL;

  /**
   * The database service.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * The queue name.
   *
   * @var string
   */
  protected $name;

  /**
   * The producer topic for the queue.
   *
   * @var \RdKafka\ProducerTopic
   */
  protected $producerTopic;

  /**
   * The available topics.
   *
   * @var string[]
   */
  protected $topics = [];

  /**
   * The uuid service.
   *
   * @var \Drupal\Component\Uuid\UuidInterface
   */
  protected $uuid;

  /**
   * KafkaQueue constructor.
   *
   * @param string $name
   *   The queue/topic name.
   * @param \Drupal\Core\Database\Connection $database
   *   The database service.
   * @param \Drupal\kafka\ClientFactory $clientFactory
   *   The kafka.client_factory service.
   * @param \Drupal\Core\Site\Settings $settings
   *   The settings service.
   * @param \Drupal\Component\Uuid\UuidInterface $uuid
   *   The uuid service.
   */
  public function __construct($name, Connection $database, ClientFactory $clientFactory, Settings $settings, UuidInterface $uuid) {
    $this->clientFactory = $clientFactory;
    $this->database = $database;
    $this->name = $name;
    $this->uuid = $uuid;

    $this->checkQueueStatus();
  }

  /**
   * Warn Kafka that we unsubscribe.
   */
  public function __destruct() {
    if (isset($this->consumer)) {
      $this->consumer->unsubscribe();
    }
  }

  /**
   * Claim an item from the database.
   *
   * Mostly derived from DatabaseQueue::claimItem(). Check the comments there
   * for the not-so-intuitive logic.
   *
   * @param int $leaseTime
   *   The lease duration, in seconds.
   *
   * @return false|\Drupal\kafka\Queue\KafkaItem
   *   A fully initialized item, or FALSE if none was found in the DB.
   */
  protected function claimFromDb($leaseTime) {
    $expires = time() + $leaseTime;
    while (TRUE) {
      // This is only used if the table exists, so not exception check.
      $tableName = KafkaItem::TABLE;
      // More fields than just ki.created to have a reproducible ordering.
      $sql = <<<SQL
SELECT 
  ki.data, ki.item_id, ki.created, 
  ki.queue, ki.partition_id, ki.offset, ki.expires  
FROM kafka_item ki 
WHERE ki.expires = 0 AND ki.queue = :queue 
ORDER BY ki.created, ki.item_id ASC
SQL;
      $dbItem = $this->database
        ->queryRange($sql, 0, 1, [':queue' => $this->name])
        ->fetchObject();

      if (empty($dbItem->item_id)) {
        return FALSE;
      }

      $update = $this->database
        ->update($tableName)
        ->fields(['expires' => $expires])
        ->condition('item_id', $dbItem->item_id)
        ->condition('expires', 0);

      if ($update->execute()) {
        $item = new KafkaItem($dbItem->data, $dbItem->item_id, $dbItem->created);
        $item->queue = $dbItem->queue;
        $item->partition = $dbItem->partition_id;
        $item->offset = $dbItem->offset;
        // The dbItem object does not contain the updated $expires value.
        $item->expires = $expires;
        return $item;
      }
    }
  }

  /**
   * Claim an item from a Kafka topic.
   *
   * @param int $leaseTime
   *   The lease duration, in seconds.
   *
   * @return bool|\Drupal\kafka\Queue\KafkaItem
   *   A fully initialized item, or FALSE if none was found in the DB.
   */
  protected function claimFromKafka($leaseTime) {
    $consumer = $this->consumer();

    /** @var \RdKafka\Message $message */
    $message = $consumer->consume($this->clientFactory->consumerSettings('timeout', 100));

    switch ($message->err) {
      case RD_KAFKA_RESP_ERR_NO_ERROR:
        $item = KafkaItem::fromString($message->payload);
        $item->queue = $this->name;
        $item->partition = $message->partition;
        $item->offset = $message->offset;
        $item->expires = time() + $leaseTime;
        $item->persist($this->database);
        $error = FALSE;
        break;

      case RD_KAFKA_RESP_ERR__PARTITION_EOF:
        // No more messages; will not wait for more.
        $error = TRUE;
        break;

      case RD_KAFKA_RESP_ERR__TIMED_OUT:
        // Timed out.
        $error = TRUE;
        break;

      default:
        // We should really throw, but the Queue API says not to do it:
        // throw new \Exception($message->errstr(), $message->err);
        // so we just return an error.
        $error = TRUE;
    }

    $ret = $error ? FALSE : $item;
    return $ret;
  }

  /**
   * {@inheritdoc}
   */
  public function claimItem($lease_time = 3600) {
    // Same unspecified behavior as core DatabaseQueue::claimItem().
    if (!$this->isExisting || $this->isDeleted) {
      return FALSE;
    }

    $item = $this->claimFromDb($lease_time);
    if ($item instanceof KafkaItem) {
      return $item;
    }

    $item = $this->claimFromKafka($lease_time);
    return $item;
  }

  /**
   * Lazy fetch a configured, subscribed high-level consumer.
   *
   * @see KafkaQueue::__destruct()
   *
   * @return \RdKafka\KafkaConsumer
   *   The fully ready consumer instance.
   */
  protected function consumer() {
    if (!isset($this->consumer)) {
      $this->consumer = $this->clientFactory->highLevelConsumer();
      $this->consumer->subscribe([$this->name]);
    }
    return $this->consumer;
  }

  /**
   * Lazy fetch the consumer topic for the queue.
   *
   * @return \RdKafka\ConsumerTopic
   *   The topic.
   */
  protected function consumerTopic() {
    if (!isset($this->consumerTopic)) {
      $this->consumerTopic = $this
        ->clientFactory
        ->highLevelConsumer()
        ->newTopic($this->name);
    }

    return $this->consumerTopic;
  }

  /**
   * Check the queue status in the database and cache it on the instance.
   *
   * @return array
   *   - 0: does queue exist ?
   *   - 1: is queue marked as deleted ? Nonexistent queues are not.
   */
  protected function checkQueueStatus() {
    $table = static::TABLE;
    $sql = <<<SQL
SELECT deleted 
FROM {$table} q
WHERE q.name = :name
SQL;
    $deleted = $this->database
      ->query($sql, [':name' => $this->name])
      ->fetchField();

    if ($deleted === FALSE) {
      $this->isExisting = FALSE;
      $this->deleted = FALSE;
    }
    else {
      $this->isExisting = TRUE;
      $this->isDeleted = (bool) $deleted;
    }

    return [$this->isExisting, $this->isDeleted];
  }

  /**
   * Adds a queue item and store it directly to the queue.
   *
   * @param mixed $data
   *   Arbitrary data to be associated with the new task in the queue.
   *
   * @return false|string
   *   A unique ID if the item was successfully created and was (best effort)
   *   added to the queue, otherwise FALSE. We don't guarantee the item was
   *   committed to disk etc, but as far as we know, the item is now in the
   *   queue.
   */
  public function createItem($data) {
    if (!$this->isExisting || $this->isDeleted) {
      throw new \RuntimeException(new TranslatableMarkup(
        "Queue @name is not usable at this time.", ['@name' => $this->name]
      ));
    }

    $item = new KafkaItem($data, $this->uuid->generate());
    $this->producerTopic()->produce(RD_KAFKA_PARTITION_UA, 0, $item->payloadString());
    return $item->item_id;
  }

  /**
   * {@inheritdoc}
   *
   * Reject queues not matching a Kafka topic.
   *
   * Idempotent: it is not an error to create the queue repeatedly.
   */
  public function createQueue() {
    $name = $this->name;

    $topics = $this->clientFactory->getTopics()['topics'];
    if (!in_array($name, $topics)) {
      throw new \DomainException(new TranslatableMarkup('Failed creating queue @name, which does not match an existing topic.', ['@name' => $name]));
    }

    $this->database
      ->merge(static::TABLE)
      ->key('name', $name)
      ->fields([
        'deleted' => 0,
      ])
      ->execute();

    $this->isExisting = TRUE;
    $this->isDeleted = FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function deleteItem($item) {
    /** @var \Drupal\kafka\Queue\KafkaItem $item */
    $item->volatilize($this->database);
  }

  /**
   * {@inheritdoc}
   *
   * Idempotent: it is not an error to delete the queue repeatedly, or delete
   * a non-existent queue: it will be created as deleted.
   *
   * One of the side effects of deleting a queue is its creation without
   * checking whether the topic exists in Kafka. This is not an issue, as it
   * will not possible to use it for items until createQueue() is invoked, which
   * will check whether the topic exists when it will actually be likely to be
   * used.
   */
  public function deleteQueue() {
    $this->database
      ->merge(static::TABLE)
      ->key('name', $this->name)
      ->fields([
        'deleted' => 1,
      ])
      ->execute();

    $this->database
      ->delete(KafkaItem::TABLE)
      ->condition('queue', $this->name)
      ->execute();

    $this->isExisting = TRUE;
    $this->isDeleted = TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function garbageCollection() {
    // Purge deleted queues.
    $this->database->delete(static::TABLE)
      ->condition('deleted', 1)
      ->execute();

    // The delete query may have changed the DB for our queue... or not.
    $this->checkQueueStatus();
  }

  /**
   * {@inheritdoc}
   */
  public function numberOfItems() {
    // Information is not provided by Kafka, and 0 is a valid value.
    return 0;
  }

  /**
   * Lazy fetch the product topic for the queue.
   *
   * @return \RdKafka\ProducerTopic
   *   The topic.
   */
  protected function producerTopic() {
    if (!isset($this->producerTopic)) {
      $this->producerTopic = $this
        ->clientFactory
        ->producer()
        ->newTopic($this->name);
    }

    return $this->producerTopic;
  }

  /**
   * {@inheritdoc}
   */
  public function releaseItem($item) {
    /** @var \Drupal\kafka\Queue\KafkaItem $item */
    $item->release($this->database);
    return TRUE;
  }

}
