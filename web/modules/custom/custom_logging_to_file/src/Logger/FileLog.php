<?php

namespace Drupal\custom_logging_to_file\Logger;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Render\PlainTextOutput;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Logger\LogMessageParserInterface;
use Drupal\Core\Logger\RfcLoggerTrait;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Utility\Token;
use Drupal\filelog\FileLogException;
use Drupal\filelog\LogMessage;
use Psr\Log\LoggerInterface;

class FileLog implements LoggerInterface {

    use RfcLoggerTrait;

    /**
     * {@inheritdoc}
     */
    public function log($level, $message, array $context = []){
        kint('jou');
        die();
        \Drupal::service('custom_logging_to_file.write')->write('error', 'Watchdog logid', $message);
    }

}
