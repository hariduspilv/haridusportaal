<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface;

/**
 * Remove a queuer.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface $purgeQueuers
 *   The purge queuers service.
 * @param string $plugin_id
 *   The plugin ID of the queuer to remove.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queuer_rm($format, QueuersServiceInterface $purgeQueuers, $plugin_id) {
  $enabled = $purgeQueuers->getPluginsEnabled();

  // Verify that the queuer exists.
  if (!in_array($plugin_id, $enabled)) {
    if (in_array($format, ['yaml', 'json'])) {
      return FALSE;
    }
    return drush_set_error('ERROR', dt('The given plugin ID is not valid!'));
  }

  // Remove the queuer and finish command execution.
  unset($enabled[array_search($plugin_id, $enabled)]);
  $purgeQueuers->setPluginsEnabled($enabled);
  if (in_array($format, ['yaml', 'json'])) {
    return TRUE;
  }
  return dt('The queuer has been removed!');
}
