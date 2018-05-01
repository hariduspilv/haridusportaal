<?php

namespace Drupal\taxonomy_term_depth\QueueManager;

use Drupal\Core\Database\Query\Condition;
use Drupal\Core\Queue\DatabaseQueue;
use Drupal\Core\Queue\QueueFactory;
use Drupal\Core\Queue\QueueInterface;

class Manager {
  const QUEUE_ID = 'taxonomy_term_depth_update_depth';
  const BATCH_COUNT = 20;
  protected $vid = NULL;

  /**
   * @var QueueInterface
   */
  protected $queue = NULL;

  public function setVid($vid = NULL) {
    $this->vid = $vid;
    return $this;
  }

  public function __construct() {
    $this->setVid();

    /** @var QueueFactory $queue_factory */
    $queue_factory = \Drupal::service('queue');
    /** @var QueueInterface $queue */
    $this->queue = $queue_factory->get(static::QUEUE_ID);
  }

  public function clear() {
    $this->queue->deleteQueue();
  }

  public function queueSize() {
    return $this->queue->numberOfItems();
  }

  public function queueBatch($queue_all = TRUE) {
    $query = $this->getTermsQuery();

    if (!$queue_all) {
      $query->condition(
        (new Condition())
          ->condition('td.depth_level', '', 'IS NULL')
      );
    }
    else {
      // Delete queue if have one.
      $this->clear();
    }

    $ids = [];
    foreach ($query->execute() as $row) {
      if (count($ids) >= static::BATCH_COUNT) {
        $this->queueByIds($ids);
        $ids = [];
      }

      $ids[] = $row->tid;
    }

    // Queue remaining items.
    $this->queueByIds($ids);

    return TRUE;
  }

  public function queueBatchMissing() {
    return $this->queueBatch(FALSE);
  }

  public function queueByIds($ids) {
    if (empty($ids)) {
      return FALSE;
    }

    $this->clearDepths($ids);
    foreach ($ids as $tid) {
      $this->queue->createItem([
        'tid' => $tid
      ]);
    }

    $this->processQueue();

    return TRUE;
  }

  public function clearDepths($ids = NULL) {
    $query = \Drupal::database()->update('taxonomy_term_field_data');
    $query ->fields([
        'depth_level' => NULL,
      ]);

    if ($this->vid !== NULL) {
      $query->condition('vid', $this->vid);
    }

    if ($ids !== NULL && is_array($ids) && !empty($ids)) {
      $query->condition('tid', $ids, 'IN');
    }

    return $query->execute();
  }

  protected function getTermsQuery() {
    $query = \Drupal::database()->select('taxonomy_term_field_data', 'td');
    $query->fields('td', ['tid']);

    if ($this->vid !== NULL) {
      $query->condition('td.vid', $this->vid);
    }

    return $query;
  }

  public function processQueue() {
    $queue_worker = \Drupal::service('plugin.manager.queue_worker')->createInstance('taxonomy_term_depth_update_depth');

    while($item = $this->queue->claimItem()) {
      try {
        $queue_worker->processItem($item->data);
        $this->queue->deleteItem($item);
      }
      catch (SuspendQueueException $e) {
        $this->queue->releaseItem($item);
        break;
      }
      catch (\Exception $e) {
        watchdog_exception('npq', $e);
      }
    }
  }

  public function processNextItem() {
    $item = $this->queue->claimItem();
    taxonomy_term_depth_get_by_tid($item['tid'], TRUE);
  }
}
