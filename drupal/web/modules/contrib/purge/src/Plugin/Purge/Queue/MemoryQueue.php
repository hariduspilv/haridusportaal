<?php

namespace Drupal\purge\Plugin\Purge\Queue;

/**
 * A QueueInterface compliant volatile memory buffer queue.
 *
 * @warning
 * This queue does not extend core's Memory queue on purpose, as it does not
 * suit extending it very well nor does its lease time handling work.
 *
 * @PurgeQueue(
 *   id = "memory",
 *   label = @Translation("Memory"),
 *   description = @Translation("A non-persistent, per-request memory queue (not useful on production systems)."),
 * )
 */
class MemoryQueue extends QueueBase implements QueueInterface {

  /**
   * Whether the buffer has been initialized or not.
   *
   * @var bool
   */
  protected $bufferInitialized;

  /**
   * The internal buffer where all data is copied in.
   *
   * @var array[]
   */
  protected $buffer;

  /**
   * Define constants for the array indiced in our buffer.
   */
  const DATA = 0;
  const EXPIRE = 1;
  const CREATED = 2;

  /**
   * Initialize the buffer.
   */
  private function bufferInitialize() {
    if (!$this->bufferInitialized) {
      $this->bufferInitialized = TRUE;
      $this->buffer = [];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function createItem($data) {
    $this->bufferInitialize();
    end($this->buffer);
    $id = key($this->buffer) + 1;
    $this->buffer[$id] = [
      self::DATA => serialize($data),
      self::EXPIRE => 0,
      self::CREATED => time(),
    ];
    return $id;
  }

  /**
   * {@inheritdoc}
   */
  public function createItemMultiple(array $items) {
    $this->bufferInitialize();
    end($this->buffer);
    $id = key($this->buffer) + 1;
    $ids = [];
    foreach ($items as $data) {
      $this->buffer[$id] = [
        self::DATA => serialize($data),
        self::EXPIRE => 0,
        self::CREATED => time(),
      ];
      $ids[] = $id;
      $id++;
    }
    return $ids;
  }

  /**
   * {@inheritdoc}
   */
  public function numberOfItems() {
    $this->bufferInitialize();
    return count($this->buffer);
  }

  /**
   * {@inheritdoc}
   */
  public function claimItem($lease_time = 3600, $id = NULL) {
    if ($id == NULL) {
      $this->bufferInitialize();
      reset($this->buffer);
      $id = key($this->buffer);
    }
    if (empty($this->buffer)) {
      return FALSE;
    }
    if (!isset($this->buffer[$id])) {
      return FALSE;
    }
    if (
      ($this->buffer[$id][self::EXPIRE] === 0)
      || (($this->buffer[$id][self::EXPIRE] !== 0)
        && (time() > $this->buffer[$id][self::EXPIRE]))
      ) {
      $this->buffer[$id][self::EXPIRE] = time() + $lease_time;
      $item = new \stdClass();
      $item->item_id = $id;
      $item->data = unserialize($this->buffer[$id][self::DATA]);
      $item->expire = $this->buffer[$id][self::EXPIRE];
      $item->created = $this->buffer[$id][self::CREATED];
      return $item;
    }
    else {
      $id++;
      return $this->claimItem($lease_time, $id);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function claimItemMultiple($claims = 10, $lease_time = 3600) {
    $items = [];
    for ($i = 1; $i <= $claims; $i++) {
      if (($item = $this->claimItem($lease_time, NULL)) === FALSE) {
        break;
      }
      $items[] = $item;
    }
    return $items;
  }

  /**
   * {@inheritdoc}
   */
  public function releaseItem($item) {
    $this->bufferInitialize();
    if (!isset($this->buffer[$item->item_id])) {
      return FALSE;
    }
    $this->buffer[$item->item_id][self::EXPIRE] = 0;
    if ($item->data !== $this->buffer[$item->item_id][self::DATA]) {
      $this->buffer[$item->item_id][self::DATA] = serialize($item->data);
    }
    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function releaseItemMultiple(array $items) {
    $this->bufferInitialize();
    foreach ($items as $item) {
      $this->releaseItem($item);
    }
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function deleteItem($item) {
    $this->bufferInitialize();
    if (!isset($this->buffer[$item->item_id])) {
      return FALSE;
    }
    unset($this->buffer[$item->item_id]);
  }

  /**
   * {@inheritdoc}
   */
  public function deleteItemMultiple(array $items) {
    $this->bufferInitialize();
    foreach ($items as $item) {
      $this->deleteItem($item);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function createQueue() {
    $this->bufferInitialize();
  }

  /**
   * {@inheritdoc}
   */
  public function deleteQueue() {
    $this->bufferInitialize();
    $this->buffer = [];
  }

  /**
   * {@inheritdoc}
   */
  public function selectPage($page = 1) {
    if (($page < 1) || !is_int($page)) {
      throw new \LogicException('Parameter $page has to be a positive integer.');
    }
    $this->bufferInitialize();

    // Calculate the start and end of the IDs we're looking for and iterate.
    $items = [];
    $limit = $this->selectPageLimit();
    $start = (($page - 1) * $limit) + 1;
    $end = ($page * $limit) + 1;
    for ($id = $start; $id < $end; $id++) {
      if (!isset($this->buffer[$id])) {
        break;
      }
      $item = new \stdClass();
      $item->item_id = $id;
      $item->data = unserialize($this->buffer[$id][self::DATA]);
      $item->expire = $this->buffer[$id][self::EXPIRE];
      $item->created = $this->buffer[$id][self::CREATED];
      $items[] = $item;
    }
    return $items;
  }

}
