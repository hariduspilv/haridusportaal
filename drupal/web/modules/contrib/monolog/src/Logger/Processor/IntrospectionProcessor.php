<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Logger;
use Monolog\Processor\IntrospectionProcessor as MonologIntrospectionProcessor;

/**
 * Injects line/file:class/function where the log message came from.
 *
 * Skip classes from Drupal\monolog\Logger namespace.
 */
class IntrospectionProcessor extends MonologIntrospectionProcessor {

  /**
   * Constructs a Default object.
   *
   * @inheritDoc
   */
  public function __construct() {
    parent::__construct(Logger::DEBUG, ['Drupal\\monolog\\Logger\\'], 0);
  }

}
