<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface;

/**
 * Remove a processor.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface $purgeProcessors
 *   The purge processors service.
 * @param string $plugin_id
 *   The plugin ID of the processor to remove.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_processor_rm($format, ProcessorsServiceInterface $purgeProcessors, $plugin_id) {
  $enabled = $purgeProcessors->getPluginsEnabled();

  // Verify that the processor exists.
  if (!in_array($plugin_id, $enabled)) {
    if (in_array($format, ['yaml', 'json'])) {
      return FALSE;
    }
    return drush_set_error('ERROR', dt('The given plugin ID is not valid!'));
  }

  // Remove the processor and finish command execution.
  unset($enabled[array_search($plugin_id, $enabled)]);
  $purgeProcessors->setPluginsEnabled($enabled);
  if (in_array($format, ['yaml', 'json'])) {
    return TRUE;
  }
  return dt('The processor has been removed!');
}
