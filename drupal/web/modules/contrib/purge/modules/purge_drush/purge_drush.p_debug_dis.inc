<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\Core\Logger\RfcLogLevel;
use Drupal\purge\Logger\LoggerServiceInterface;

/**
 * Disable debugging for all of Purge's log channels.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Logger\LoggerServiceInterface $purgeLogger
 *   The purge logger service.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_debug_dis($format, LoggerServiceInterface $purgeLogger) {
  $channels = function() use($purgeLogger) {
    $ids = [];
    foreach ($purgeLogger->getChannels() as $channel) {
      if (in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
        $ids[] = $channel['id'];
      }
    }
    return $ids;
  };
  $disable = function() use($purgeLogger) {
    foreach ($purgeLogger->getChannels() as $channel) {
      if (in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
        $key = array_search(RfcLogLevel::DEBUG, $channel['grants']);
        unset($channel['grants'][$key]);
        $purgeLogger->setChannel($channel['id'], $channel['grants']);
      }
    }
  };

  // Just disable debugging for non-interactive formats.
  if (in_array($format, ['yaml', 'json'])) {
    $disable();
    return TRUE;
  }
  elseif (empty($channels())) {
    return dt("Debugging already disabled for all channels.");
  }

  // Present the user with some help and a conformation message.
  elseif ($format == 'string') {
    drush_print("Disabling debug logging for the following log channels:");
    foreach ($channels() as $id) {
      drush_print(' - ' . $id);
    }
    $disable();
    return dt("\nDone!");
  }
}
