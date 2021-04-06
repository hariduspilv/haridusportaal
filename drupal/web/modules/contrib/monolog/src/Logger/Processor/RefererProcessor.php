<?php

namespace Drupal\monolog\Logger\Processor;

/**
 * Class RefererProcessor.
 */
class RefererProcessor extends AbstractRequestProcessor {

  /**
   * {@inheritdoc}
   */
  public function __invoke(array $record) {
    if ($request = $this->getRequest()) {
      $record['extra']['referer'] = $request->headers->get('Referer', '');
    }

    return $record;
  }

}
