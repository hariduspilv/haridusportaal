<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;

/**
 * Move the given purger UP in the execution order.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purgePurgers
 *   The purge purgers service.
 * @param string $instance_id
 *   The instance ID of the purger to move up.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_purger_mvu($format, PurgersServiceInterface $purgePurgers, $instance_id) {
  $enabled = $purgePurgers->getPluginsEnabled();

  // Verify that the purger instance exists.
  if (!isset($enabled[$instance_id])) {
    if (in_array($format, ['yaml', 'json'])) {
      return FALSE;
    }
    return drush_set_error('ERROR', dt('The given instance ID is not valid!'));
  }

  // Move the purger up and finish command execution.
  $purgePurgers->movePurgerUp($instance_id);
  if (in_array($format, ['yaml', 'json'])) {
    return TRUE;
  }
  return dt('The purger moved one place up!');
}
