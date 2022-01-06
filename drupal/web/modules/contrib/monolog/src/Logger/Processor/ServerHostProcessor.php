<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Processor\ProcessorInterface;

/**
 * Processor that adds server host to the log records.
 */
class ServerHostProcessor extends AbstractRequestProcessor implements ProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record): array {
    if ($request = $this->getRequest()) {
      $record['extra']['server_host'] = $request->getHttpHost();
    }

    return $record;
  }

}
