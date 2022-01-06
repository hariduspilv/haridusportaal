<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Processor\ProcessorInterface;

/**
 * Processor that adds request URI to the log records.
 */
class RequestUriProcessor extends AbstractRequestProcessor implements ProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record): array {
    if ($request = $this->getRequest()) {
      $record['extra']['request_uri'] = $request->getUri();
    }

    return $record;
  }

}
