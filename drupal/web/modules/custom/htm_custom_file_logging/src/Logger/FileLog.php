<?php

namespace Drupal\htm_custom_file_logging\Logger;

use Drupal\Core\Logger\RfcLoggerTrait;
use Psr\Log\LoggerInterface;

/**
 * Logs events in the watchdog database table.
 */
class FileLog implements LoggerInterface {
  use RfcLoggerTrait;

    /**
     * System is unusable.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function emergency($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('emergency', 'Watchdog logid', $message);
    }


    /**
     * Action must be taken immediately.
     *
     * Example: Entire website down, database unavailable, etc. This should
     * trigger the SMS alerts and wake you up.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function alert($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('alert', 'Watchdog logid', $message);
    }


    /**
     * Critical conditions.
     *
     * Example: Application component unavailable, unexpected exception.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function critical($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('critical', 'Watchdog logid', $message);
    }


    /**
     * Runtime errors that do not require immediate action but should typically
     * be logged and monitored.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function error($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('error', 'Watchdog logid', $message);
    }


    /**
     * Exceptional occurrences that are not errors.
     *
     * Example: Use of deprecated APIs, poor use of an API, undesirable things
     * that are not necessarily wrong.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function warning($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('warning', 'Watchdog logid', $message);
    }

    /**
     * Normal but significant events.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function notice($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('notice', 'Watchdog logid', $message);
    }

    /**
     * Interesting events.
     *
     * Example: User logs in, SQL logs.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function info($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('info', 'Watchdog logid', $message);
    }

    /**
     * Detailed debug information.
     *
     * @param string $message
     * @param array  $context
     *
     * @return void
     */
    public function debug($message, array $context = array()){
        \Drupal::service('htm_custom_file_logging.write')->write('debug', 'Watchdog logid', $message);
    }

  /**
   * {@inheritdoc}
   */
  public function log($level, $message, array $context = []) {
      \Drupal::service('htm_custom_file_logging.write')->write('info', 'Watchdog logid', $message);
  }

}
