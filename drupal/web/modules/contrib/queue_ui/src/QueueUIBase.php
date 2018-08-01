<?php

namespace Drupal\queue_ui;

/**
 * Class QueueUIBase
 *
 * @package Drupal\queue_ui
 */
abstract class QueueUIBase implements QueueUIInterface {

  /**
   * Retrieve the available operations for the implementing queue class.
   */
  public abstract function getOperations();

  /**
   * Inspect the queue items in a specified queue.
   *
   * @param string $queue_name
   *  The name of the queue being inspected.
   */
  public abstract function getItems($queue_name);

  /**
   * @param $queue_name
   */
  public abstract function releaseItems($queue_name);

  /**
   * View item data for a specified queue item.
   *
   * @param integer $item_id
   *  The item id to be viewed.
   */
  public abstract function loadItem($item_id);

  /**
   * Force the releasing of a specified queue item.
   *
   * @param integer $item_id
   *  The item id to be released.
   */
  public abstract function releaseItem($item_id);

  /**
   * Force the deletion of a specified queue item.
   *
   * @param integer $item_id
   *  The item id to be deleted.
   */
  public abstract function deleteItem($item_id);

}