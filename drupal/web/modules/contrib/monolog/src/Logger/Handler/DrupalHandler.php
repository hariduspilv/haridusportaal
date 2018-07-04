<?php

namespace Drupal\monolog\Logger\Handler;

use Drupal\Core\Logger\RfcLogLevel;
use Monolog\Handler\AbstractHandler;
use Monolog\Logger;
use Psr\Log\LoggerInterface;

/**
 * Forwards logs to a Drupal logger.
 */
class DrupalHandler extends AbstractHandler {

  private $logger;

  private static $levels = [
    Logger::DEBUG => RfcLogLevel::DEBUG,
    Logger::INFO => RfcLogLevel::INFO,
    Logger::NOTICE => RfcLogLevel::NOTICE,
    Logger::WARNING => RfcLogLevel::WARNING,
    Logger::ERROR => RfcLogLevel::ERROR,
    Logger::CRITICAL => RfcLogLevel::CRITICAL,
    Logger::ALERT => RfcLogLevel::ALERT,
    Logger::EMERGENCY => RfcLogLevel::EMERGENCY,
  ];

  /**
   * @param \Psr\Log\LoggerInterface $wrapped
   *   The wrapped Drupal logger.
   * @param bool|int $level
   *   The minimum logging level at which this handler will be triggered.
   * @param bool $bubble
   *   Whether the messages that are handled can bubble up the stack or not.
   */
  public function __construct(LoggerInterface $wrapped, $level = Logger::DEBUG, $bubble = TRUE) {
    parent::__construct($level, $bubble);
    $this->logger = $wrapped;
  }

  /**
   * {@inheritdoc}
   */
  public function handle(array $record) {
    // Set up context with the data Drupal loggers expect.
    // @see Drupal\Core\Logger\LoggerChannel::log()
    $context = $record['context'] + [
        'channel' => $record['channel'],
        'link' => '',
        'user' => isset($record['extra']['user']) ? $record['extra']['user'] : NULL,
        'uid' => isset($record['extra']['uid']) ? $record['extra']['uid'] : 0,
        'request_uri' => isset($record['extra']['request_uri']) ? $record['extra']['request_uri'] : '',
        'referer' => isset($record['extra']['referer']) ? $record['extra']['referer'] : '',
        'ip' => isset($record['extra']['ip']) ? $record['extra']['ip'] : 0,
        'timestamp' => $record['datetime']->format('U'),
      ];
    $level = static::$levels[$record['level']];
    $this->logger->log($level, $record['message'], $context);
  }

}
