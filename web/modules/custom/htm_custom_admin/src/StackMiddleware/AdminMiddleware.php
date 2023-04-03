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
  protected HttpKernelInterface $httpKernel;

  protected bool $anonymous;

  protected string $query;
  /**
   * Creates a HTTP middleware handler.
   *
   * @param \Symfony\Component\HttpKernel\HttpKernelInterface $kernel
   *   The HTTP kernel.
   */
  public function __construct(HttpKernelInterface $kernel) {
    $this->httpKernel = $kernel;
    $this->anonymous = true;
    $this->query = 'SESS';
  }

  /**
   * {@inheritdoc}
   */
  public function handle(Request $request, $type = self::MASTER_REQUEST, $catch = TRUE) {
    $safeUrl = false;

    $safePaths = [
      '',
    ];

    $contains = [
      '/login',
      '/user',
      '/graphql',
      '/external-login',
      '/documentFile',
      '/session',
      '/crop_large'
    ];

    foreach($request->cookies->keys() as $key) {
      if(strpos($key, $this->query) === 0) {
        $this->anonymous = false;
      }
    }

    foreach($contains as $string) {
      if(strpos($request->getPathInfo(), $string) !== FALSE) {
        $safeUrl = true;
      }
    }

    if($request->getRequestFormat() === 'html' &&
      !$safeUrl &&
      !in_array($request->getPathInfo(), $safePaths) &&
      $this->anonymous &&
      !$request->headers->get('authorization')){
      $fe_url = \Drupal::config('htm_custom_admin_form.customadmin')->get('general.fe_url');
      $fe_url = \Drupal::state()->get('general.fe_url');
      $response = new RedirectResponse($fe_url);
      $response->send();
    }

    return $this->httpKernel->handle($request, $type, $catch);
  }

  private function endsWith($string, $endString)
  {
    $len = strlen($endString);
    if ($len === 0) {
      return true;
    }
    return (substr($string, -$len) === $endString);
  }
}
