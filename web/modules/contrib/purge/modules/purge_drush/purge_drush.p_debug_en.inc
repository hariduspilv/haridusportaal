<?php

/**
 * @file
 * Administrative Drush commands for Purge - Command File.
 */

use Drupal\Core\Logger\RfcLogLevel;
use Drupal\purge\Logger\LoggerServiceInterface;

/**
 * Enable debugging for all of Purge's log channels.
 *
 * @param string $format
 *   The default or selected output format of the command.
 * @param \Drupal\purge\Logger\LoggerServiceInterface $purgeLogger
 *   The purge logger service.
 *
 * @return array
 *   Drush render/format array.
 */
function purge_drush_p_debug_en($format, LoggerServiceInterface $purgeLogger) {
  $channels = function() use($purgeLogger) {
    $ids = [];
    foreach ($purgeLogger->getChannels() as $channel) {
      if (!in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
        $ids[] = $channel['id'];
      }
    }
    return $ids;
  };
  $enable = function() use($purgeLogger) {
    foreach ($purgeLogger->getChannels() as $channel) {
      if (!in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
        $channel['grants'][] = RfcLogLevel::DEBUG;
        $purgeLogger->setChannel($channel['id'], $channel['grants']);
      }
    }
  };

  // Just enable debugging for non-interactive formats.
  if (in_array($format, ['yaml', 'json'])) {
    $enable();
    return TRUE;
  }
  elseif (empty($channels())) {
    return dt("Debugging already enabled for all channels.");
  }

  // Present the user with some help and a conformation message.
  elseif ($format == 'string') {
    drush_print("About to enable debugging for the following log channels:");
    foreach ($channels() as $id) {
      drush_print(' - ' . $id);
    }
    drush_print("\nOnce enabled, this allows you to run Drush commands like"
      . " p-queue-work with the -v parameter, giving you a detailed"
      . " amount of live-debugging information getting logged by Purge"
      . " and modules integrating with it."
      . " HOWEVER, debug logging is VERY verbose and can add"
      . " millions of messages when left enabled for too long. NEVER"
      . " enable this on a production environment without fully"
      . " understanding the consequences!\n"
    );

    if (drush_confirm("Are you sure you want to enable it?")) {
      $enable();
      drush_print("Enabled! Use p-debug-dis to disable when you're finished!");
    }
    else {
      drush_user_abort();
    }
  }
}
