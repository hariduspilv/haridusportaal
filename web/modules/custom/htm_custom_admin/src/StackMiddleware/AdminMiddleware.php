<?php

namespace Drupal\htm_custom_admin\StackMiddleware;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\HttpKernelInterface;

/**
 * Performs a custom task.
 */
class AdminMiddleware implements HttpKernelInterface {

  /**
   * The wrapped HTTP kernel.
   *
   * @var \Symfony\Component\HttpKernel\HttpKernelInterface
   */
  protected $httpKernel;

  /**
   * Creates a HTTP middleware handler.
   *
   * @param \Symfony\Component\HttpKernel\HttpKernelInterface $kernel
   *   The HTTP kernel.
   */
  public function __construct(HttpKernelInterface $kernel) {
    $this->httpKernel = $kernel;
  }

  /**
   * {@inheritdoc}
   */
  public function handle(Request $request, $type = self::MASTER_REQUEST, $catch = TRUE) {
    $safePaths = [
      '/user/login',
      '/user'
    ];
    $allowedMethods = [
      'GET',
      'OPTIONS',
      'PUT',
      'POST'
    ];

    if($request->getRequestFormat() === 'html' && !in_array($request->getPathInfo(), $safePaths) && \Drupal::currentUser()->isAnonymous()){
      $fe_url = \Drupal::config('htm_custom_admin_form.customadmin')->get('general.fe_url');
      $response = new RedirectResponse($fe_url);
      $response->send();
    }

    return $this->httpKernel->handle($request, $type, $catch);
  }
}
