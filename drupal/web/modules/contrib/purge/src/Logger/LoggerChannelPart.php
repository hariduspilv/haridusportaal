<?php

namespace Drupal\purge\Logger;

use Drupal\Core\Logger\RfcLogLevel;
use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

/**
 * Provides a subchannel whichs logs to a single main channel with permissions.
 */
class LoggerChannelPart implements LoggerChannelPartInterface {

  /**
   * Access levels for each RFC 5424 log type.
   *
   * The constructor changes the granted levels to TRUE so that $grants
   * doesn't have to be searched/iterated each and every time.
   *
   * @var bool[]
   */
  protected $access = [
    RfcLogLevel::EMERGENCY => FALSE,
    RfcLogLevel::ALERT => FALSE,
    RfcLogLevel::CRITICAL => FALSE,
    RfcLogLevel::ERROR => FALSE,
    RfcLogLevel::WARNING => FALSE,
    RfcLogLevel::NOTICE => FALSE,
    RfcLogLevel::INFO => FALSE,
    RfcLogLevel::DEBUG => FALSE,
  ];

  /**
   * The identifier of the channel part.
   *
   * @var string
   */
  protected $id = '';

  /**
   * Permitted RFC 5424 log types.
   *
   * @var int[]
   */
  protected $grants = [];

  /**
   * The single and central logger channel used by purge module(s).
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $loggerChannelPurge;

  /**
   * {@inheritdoc}
   */
  public function __construct(LoggerInterface $logger_channel_purge, $id, array $grants = []) {
    $this->id = $id;
    $this->grants = $grants;
    $this->loggerChannelPurge = $logger_channel_purge;
    foreach ($grants as $grant) {
      $this->access[$grant] = TRUE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getGrants() {
    return $this->grants;
  }

  /**
   * {@inheritdoc}
   */
  public function isDebuggingEnabled() {
    return $this->access[RfcLogLevel::DEBUG];
  }

  /**
   * {@inheritdoc}
   */
  public function emergency($message, array $context = []) {
    if ($this->access[RfcLogLevel::EMERGENCY]) {
      $this->log(LogLevel::EMERGENCY, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function alert($message, array $context = []) {
    if ($this->access[RfcLogLevel::ALERT]) {
      $this->log(LogLevel::ALERT, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function critical($message, array $context = []) {
    if ($this->access[RfcLogLevel::CRITICAL]) {
      $this->log(LogLevel::CRITICAL, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function error($message, array $context = []) {
    if ($this->access[RfcLogLevel::ERROR]) {
      $this->log(LogLevel::ERROR, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function warning($message, array $context = []) {
    if ($this->access[RfcLogLevel::WARNING]) {
      $this->log(LogLevel::WARNING, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function notice($message, array $context = []) {
    if ($this->access[RfcLogLevel::NOTICE]) {
      $this->log(LogLevel::NOTICE, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function info($message, array $context = []) {
    if ($this->access[RfcLogLevel::INFO]) {
      $this->log(LogLevel::INFO, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function debug($message, array $context = []) {
    if ($this->access[RfcLogLevel::DEBUG]) {
      $this->log(LogLevel::DEBUG, $message, $context);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function log($level, $message, array $context = []) {
    $context += ['@purge_channel_part' => $this->id];
    $message = '@purge_channel_part: ' . $message;
    $this->loggerChannelPurge->log($level, $message, $context);
  }

}
