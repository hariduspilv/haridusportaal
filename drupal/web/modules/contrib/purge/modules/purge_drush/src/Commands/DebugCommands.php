<?php

namespace Drupal\purge_drush\Commands;

use Drupal\Core\Logger\RfcLogLevel;
use Drupal\purge\Logger\LoggerServiceInterface;
use Drush\Commands\DrushCommands;
use Drush\Exceptions\UserAbortException;

/**
 * Commands to help debugging caching and Purge.
 */
class DebugCommands extends DrushCommands {

  /**
   * The 'purge.logger' service.
   *
   * @var \Drupal\purge\Logger\LoggerServiceInterface
   */
  protected $purgeLogger;

  /**
   * Construct a DebugCommands object.
   *
   * @param \Drupal\purge\Logger\LoggerServiceInterface $purge_logger
   *   The purge logger service.
   */
  public function __construct(LoggerServiceInterface $purge_logger) {
    parent::__construct();
    $this->purgeLogger = $purge_logger;
  }

  /**
   * Disable debugging for all of Purge's log channels.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:debug-disable
   *   Disables the log channels.
   *
   * @command p:debug-dis
   * @aliases pddis,p-debug-dis
   */
  public function debugDisable(array $options = ['format' => 'string']) {
    $enabled_channels = function () {
      $ids = [];
      foreach ($this->purgeLogger->getChannels() as $channel) {
        if (in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
          $ids[] = $channel['id'];
        }
      }
      return $ids;
    };

    // Abort when debugging is already disabled everywhere.
    if (empty($enabled_channels())) {
      throw new \Exception(dt("Debugging already disabled for all channels."));
    }

    // Prepend some output when we're operating interactively.
    if ($options['format'] == 'string') {
      $this->io()->writeln(dt("Disabled debug logging for the following log channels:"));
      $this->io()->listing($enabled_channels());
    }

    // Disable debugging for all channels.
    foreach ($this->purgeLogger->getChannels() as $channel) {
      if (in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
        $key = array_search(RfcLogLevel::DEBUG, $channel['grants']);
        unset($channel['grants'][$key]);
        $this->purgeLogger->setChannel($channel['id'], $channel['grants']);
      }
    }
  }

  /**
   * Enable debugging for all of Purge's log channels.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:debug-enable
   *   Enables the log channels.
   *
   * @command p:debug-en
   * @aliases pden,p-debug-en
   */
  public function debugEnable(array $options = ['format' => 'string']) {
    $disabled_channels = function () {
      $ids = [];
      foreach ($this->purgeLogger->getChannels() as $channel) {
        if (!in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
          $ids[] = $channel['id'];
        }
      }
      return $ids;
    };
    $enable = function () {
      foreach ($this->purgeLogger->getChannels() as $channel) {
        if (!in_array(RfcLogLevel::DEBUG, $channel['grants'])) {
          $channel['grants'][] = RfcLogLevel::DEBUG;
          $this->purgeLogger->setChannel($channel['id'], $channel['grants']);
        }
      }
    };

    // Abort when debugging is already enabled everywhere.
    if (empty($disabled_channels())) {
      throw new \Exception(dt("Debugging already enabled for all channels."));
    }

    // Ask the user to interactively confirm, given the potential consequences.
    if ($options['format'] == 'string') {
      $this->output()->writeln(dt("About to enable debugging for the following log channels:"));
      $this->io()->listing($disabled_channels());
      $this->io()->caution(dt(
          "Once enabled, this allows you to run Drush commands like"
        . " p:queue-work with the -d parameter, giving you a detailed"
        . " amount of live-debugging information getting logged by Purge"
        . " and modules integrating with it."
        . " HOWEVER, debug logging is VERY verbose and can add"
        . " millions of messages when left enabled for too long. NEVER"
        . " enable this on a production environment without fully"
        . " understanding the consequences!"
      ));

      if ($this->io()->confirm(dt("Are you sure you want to enable it?"))) {
        $enable();
        $this->output()->writeln(dt("Enabled! Use p:debug-dis to disable when you're finished!"));
      }
      else {
        throw new UserAbortException();
      }
    }
    // In all other modes, just execute the command.
    else {
      $enable();
    }
  }

}
