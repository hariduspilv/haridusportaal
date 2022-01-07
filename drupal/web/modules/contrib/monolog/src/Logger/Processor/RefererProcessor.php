<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Processor\ProcessorInterface;

/**
 * Processor that adds Referer to the log records.
 */
class RefererProcessor extends AbstractRequestProcessor implements ProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record): array {
    if ($request = $this->getRequest()) {
      $record['extra']['referer'] = $request->headers->get('Referer', '');
    }

    return $record;
  }

}
