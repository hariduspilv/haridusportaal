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
   * {@inheritdoc}
   */
  public function log($level, $message, array $context = []) {
      \Drupal::service('htm_custom_file_logging.write')->write($level, 'Watchdog logid', $message);
  }

}
