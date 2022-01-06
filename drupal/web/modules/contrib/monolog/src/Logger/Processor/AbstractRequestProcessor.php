<?php

namespace Drupal\monolog\Logger\Processor;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Base class for all processors that needs access to request data.
 */
abstract class AbstractRequestProcessor {

  /**
   * The Request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  private RequestStack $requestStack;

  /**
   * RequestProcessor constructor.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $requestStack
   *   The Request stack.
   */
  public function __construct(RequestStack $requestStack) {
    $this->requestStack = $requestStack;
  }

  /**
   * Return the current request.
   *
   * @return null|\Symfony\Component\HttpFoundation\Request
   *   The current request.
   */
  public function getRequest(): ?Request {
    if ($request = $this->requestStack->getCurrentRequest()) {
      return $request;
    }

    return NULL;
  }

}
