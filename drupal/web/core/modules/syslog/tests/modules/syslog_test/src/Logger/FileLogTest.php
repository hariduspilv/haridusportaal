<?php

namespace Drupal\syslog_test\Logger;

use Drupal\syslog\Logger\FileLog;
use Psr\Log\LoggerInterface;

/**
 * Redirects logging messages to error_log.
 */
class FileLogTest extends FileLog implements LoggerInterface {

  /**
   * {@inheritdoc}
   */
  protected function syslogWrapper($level, $entry) {
    $log_path = \Drupal::service('file_system')->realpath('public://syslog.log');
    error_log($entry . PHP_EOL, 3, $log_path);
  }

}
