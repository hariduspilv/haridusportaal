<?php

namespace Drupal\monolog\Logger\Processor;

use Monolog\Processor\ProcessorInterface;

/**
 * Processor that adds IP information to the log records.
 */
class IpProcessor extends AbstractRequestProcessor implements ProcessorInterface {

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record): array {
    if ($request = $this->getRequest()) {
      $record['extra']['ip'] = $request->getClientIp();
    }

    return $record;
  }

}
