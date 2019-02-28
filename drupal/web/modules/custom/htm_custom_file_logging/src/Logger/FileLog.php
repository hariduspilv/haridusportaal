<?php

namespace Drupal\htm_custom_file_logging\Logger;

use Drupal\Core\Logger\LogMessageParserInterface;
use Drupal\dblog\Logger\DbLog;
use Drupal\Core\Database\Connection;

/**
 * Logs events in the watchdog database table.
 */
class FileLog extends DbLog {

    /**
     * Constructs a DbLog object.
     *
     * @param \Drupal\Core\Database\Connection $connection
     *   The database connection object.
     * @param \Drupal\Core\Logger\LogMessageParserInterface $parser
     *   The parser to use when extracting message variables.
     */
    public function __construct(Connection $connection, LogMessageParserInterface $parser) {
        parent::__construct($connection, $parser);
    }

    public function log($level, $message, array $context = [])
    {
        parent::log($level, $message, $context);
        \Drupal::service('htm_custom_file_logging.write')->write('info', 'Watchdog logid', $message.' severity '.$level);
    }
}
