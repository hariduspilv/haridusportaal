<?php

namespace Drupal\monolog\Logger\Handler;

use Drupal\Core\Logger\RfcLogLevel;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Logger;
use Psr\Log\LoggerInterface;

/**
 * Forwards logs to a Drupal logger.
 */
class DrupalHandler extends AbstractProcessingHandler {

  /**
   * The wrapped Drupal logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected LoggerInterface $logger;

  /**
   * Map between PSR-3 log levels and Drupal log levels.
   *
   * @var array
   */
  protected static array $levels = [
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
   * Constructs a Default object.
   *
   * @param \Psr\Log\LoggerInterface $wrapped
   *   The wrapped Drupal logger.
   * @param int|string $level
   *   The minimum logging level at which this handler will be triggered.
   * @param bool $bubble
   *   Whether the messages that are handled can bubble up the stack or not.
   */
  public function __construct(
    LoggerInterface $wrapped,
    $level = Logger::DEBUG,
    bool $bubble = TRUE
  ) {
    parent::__construct($level, $bubble);

    $this->logger = $wrapped;
  }

  /**
   * {@inheritdoc}
   */
  public function write(array $record): void {
    // Set up context with the data Drupal loggers expect.
    // @see Drupal\Core\Logger\LoggerChannel::log()
    $context = $record['context'] + ($record['drupal_context_placeholders'] ?? []) + [
      'channel' => $record['channel'],
      'link' => '',
      'user' => $record['extra']['user'] ?? NULL,
      'uid' => $record['extra']['uid'] ?? 0,
      'request_uri' => $record['extra']['request_uri'] ?? '',
      'referer' => $record['extra']['referer'] ?? '',
      'ip' => $record['extra']['ip'] ?? 0,
      'timestamp' => $record['datetime']->format('U'),
    ];
    $level = static::$levels[$record['level']];

    $this->logger->log($level, $record['drupal_message'] ?? $record['message'], $context);
  }

}
