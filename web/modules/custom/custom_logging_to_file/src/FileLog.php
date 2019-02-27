<?php

namespace Drupal\custom_logging_to_file;

use Drupal\Core\Logger\RfcLoggerTrait;
use Psr\Log\LoggerInterface;

class FileLog implements LoggerInterface
{
    use RfcLoggerTrait;

    /**
     * {@inheritdoc}
     */
    public function log($level, $message, array $context = array())
    {
        \Drupal::service('custom_logging_to_file.write')->write('error', 'Watchdog logid', $message);
    }
}