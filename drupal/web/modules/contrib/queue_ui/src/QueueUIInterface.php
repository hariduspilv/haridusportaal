<?php

namespace Drupal\queue_ui;

/**
 * Provides the Queue UI interface for inspecting queue data.
 */
interface QueueUIInterface {

  /**
   * Retrieve the available operations for the implementing queue class.
   */
  public function getOperations();

  /**
   * Inspect the queue items in a specified queue.
   *
   * @param string $queue_name
   *  The name of the queue being inspected.
   */
  public function getItems($queue_name);

  /**
   * @param $queue_name
   */
  public function releaseItems($queue_name);

  /**
   * View item data for a specified queue item.
   *
   * @param integer $item_id
   *  The item id to be viewed.
   */
  public function loadItem($item_id);

  /**
   * Force the releasing of a specified queue item.
   *
   * @param integer $item_id
   *  The item id to be released.
   */
  public function releaseItem($item_id);

  /**
   * Force the deletion of a specified queue item.
   *
   * @param integer $item_id
   *  The item id to be deleted.
   */
  public function deleteItem($item_id);

}