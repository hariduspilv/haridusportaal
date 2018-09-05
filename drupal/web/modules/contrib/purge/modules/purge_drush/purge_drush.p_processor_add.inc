<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface;

/**
 * Add a new processor.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface $purgeProcessors
 *   The purge processors service.
 * @param string $plugin_id
 *   The plugin ID of the processor to add.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_processor_add($format, ProcessorsServiceInterface $purgeProcessors, $plugin_id) {
  $enabled = $purgeProcessors->getPluginsEnabled();
  $available = $purgeProcessors->getPluginsAvailable();

  // Verify that the plugin exists.
  if (!isset($purgeProcessors->getPlugins()[$plugin_id])) {
    if (in_array($format, ['yaml', 'json'])) {
      return FALSE;
    }
    return drush_set_error('ERROR', dt('The given plugin does not exist!'));
  }

  // Verify that the plugin is available and thus not yet enabled.
  if (!in_array($plugin_id, $purgeProcessors->getPluginsAvailable())) {
    if (in_array($format, ['yaml', 'json'])) {
      return TRUE;
    }
    return dt('This processor is already enabled!');
  }

  // Define the new instance and store it.
  $enabled[] = $plugin_id;
  $purgeProcessors->setPluginsEnabled($enabled);
  if (in_array($format, ['yaml', 'json'])) {
    return TRUE;
  }
  return dt('The processor has been added!');
}
