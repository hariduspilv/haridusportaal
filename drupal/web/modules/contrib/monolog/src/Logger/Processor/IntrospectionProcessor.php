<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Logger;
use Monolog\Processor\IntrospectionProcessor as MonologIntrospectionProcessor;

/**
 * Class IntrospectionProcessor
 */
class IntrospectionProcessor extends MonologIntrospectionProcessor {

  /**
   * @inheritDoc
   */
  public function __construct() {
    parent::__construct( Logger::DEBUG, array('Drupal\\monolog\\Logger\\'), 0);
  }

}
