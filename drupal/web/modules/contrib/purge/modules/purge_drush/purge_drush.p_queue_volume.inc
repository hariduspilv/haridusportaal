<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface;

/**
 * Count how many items currently sit in the queue.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface $purgeQueue
 *   The purge queue service.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queue_volume($format, QueueServiceInterface $purgeQueue) {
  $volume = $purgeQueue->numberOfItems();
  if (in_array($format, ['yaml', 'json'])) {
    return $volume;
  }
  return dt('There are @total items in the queue.', ['@total' => $volume]);
}
