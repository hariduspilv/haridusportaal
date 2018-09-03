<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface;

/**
 * List available queuer plugin IDs that can be added.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Queuer\QueuersServiceInterface $purgeQueuers
 *   The purge queuers service.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_queuer_lsa($format, QueuersServiceInterface $purgeQueuers) {
  $definitions = $purgeQueuers->getPlugins();
  $available = $purgeQueuers->getPluginsAvailable();
  $output = [];

  // Return a simple listing of each queuer plugin ID.
  if ($format == 'list') {
    foreach ($available as $plugin_id) {
      $output[] = $plugin_id;
    }
    $output[] = '';
  }

  // Return a complexer data structure that can be rendered as table/yaml/json.
  elseif (in_array($format, ['table', 'yaml', 'json'])) {
    foreach ($available as $plugin_id) {
      $output[$plugin_id] = [
        'plugin_id' => $plugin_id,
        'label' => (string) $definitions[$plugin_id]['label'],
        'description' => (string) $definitions[$plugin_id]['description'],
      ];
    }
  }

  return $output;
}
