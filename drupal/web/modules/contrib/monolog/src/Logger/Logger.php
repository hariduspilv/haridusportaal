<?php

namespace Drupal\monolog\Logger;

use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\Core\Logger\RfcLogLevel;
use Drupal\Core\Session\AccountInterface;
use Monolog\Logger as BaseLogger;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Logger class for the Drupal Monolog module.
 *
 * Allows the channel to be modified after the class is instantiated. This is
 * normally not a good idea, but it is necessary to reconcile the differences in
 * the Monolog library and how the watchdog type relates to the logging
 * facility.
 */
class Logger extends BaseLogger implements LoggerChannelInterface {

  /**
   * Map of RFC 5424 log constants to Monolog log constants.
   *
   * @var array
   */
  protected $levelTranslation = array(
    RfcLogLevel::EMERGENCY => MonologLogLevel::EMERGENCY,
    RfcLogLevel::ALERT => MonologLogLevel::ALERT,
    RfcLogLevel::CRITICAL => MonologLogLevel::CRITICAL,
    RfcLogLevel::ERROR => MonologLogLevel::ERROR,
    RfcLogLevel::WARNING => MonologLogLevel::WARNING,
    RfcLogLevel::NOTICE => MonologLogLevel::NOTICE,
    RfcLogLevel::INFO => MonologLogLevel::INFO,
    RfcLogLevel::DEBUG => MonologLogLevel::DEBUG,
  );

  /**
   * {@inheritdoc}
   */
  public function addRecord($level, $message, array $context = array()) {
    if (array_key_exists($level, $this->levelTranslation)) {
      $level = $this->levelTranslation[$level];
    }

    parent::addRecord($level, $message, $context);
  }

  /**
   * {@inheritdoc}
   */
  public function setRequestStack(RequestStack $requestStack = NULL) {
    // Do nothing, use a handler for this.
  }

  /**
   * {@inheritdoc}
   */
  public function setCurrentUser(AccountInterface $current_user = NULL) {
    // Do nothing, use a handler for this.
  }

  /**
   * {@inheritdoc}
   */
  public function setLoggers(array $loggers) {
    // Do nothing.
  }

  /**
   * {@inheritdoc}
   */
  public function addLogger(LoggerInterface $logger, $priority = 0) {
    // Do nothing.
  }

}
