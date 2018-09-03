<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface;

/**
 * Add a new queuer.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface $purgeQueuers
 *   The purge queuers service.
 * @param string $plugin_id
 *   The plugin ID of the queuer to add.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queuer_add($format, QueuersServiceInterface $purgeQueuers, $plugin_id) {
  $enabled = $purgeQueuers->getPluginsEnabled();
  $available = $purgeQueuers->getPluginsAvailable();

  // Verify that the plugin exists.
  if (!isset($purgeQueuers->getPlugins()[$plugin_id])) {
    if (in_array($format, ['yaml', 'json'])) {
      return FALSE;
    }
    return drush_set_error('ERROR', dt('The given plugin does not exist!'));
  }

  // Verify that the plugin is available and thus not yet enabled.
  if (!in_array($plugin_id, $purgeQueuers->getPluginsAvailable())) {
    if (in_array($format, ['yaml', 'json'])) {
      return TRUE;
    }
    return dt('This queuer is already enabled!');
  }

  // Define the new instance and store it.
  $enabled[] = $plugin_id;
  $purgeQueuers->setPluginsEnabled($enabled);
  if (in_array($format, ['yaml', 'json'])) {
    return TRUE;
  }
  return dt('The queuer has been added!');
}
