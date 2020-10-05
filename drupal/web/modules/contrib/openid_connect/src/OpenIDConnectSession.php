<?php

namespace Drupal\openid_connect;

use Drupal\Core\Path\CurrentPathStack;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Session service of the OpenID Connect module.
 */
class OpenIDConnectSession {

  /**
   * The current path.
   *
   * @var \Drupal\Core\Path\CurrentPathStack
   */
  protected $currentPath;

  /**
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Construct an instance of the OpenID Connect session service.
   *
   * @param \Drupal\Core\Path\CurrentPathStack $current_path
   *   The current path.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function __construct(
    CurrentPathStack $current_path,
    RequestStack $request_stack
  ) {
    $this->currentPath = $current_path;
    $this->requestStack = $request_stack;
  }

  /**
   * Save the current path in the session, for redirecting after authorization.
   *
   * @todo Evaluate, whether we can now use the user.private_tempstore instead
   *   of the global $_SESSION variable, as https://www.drupal.org/node/2743931
   *   has been applied to 8.5+ core.
   */
  public function saveDestination() {
    $current_path = $this->currentPath->getPath();
    $path = ($current_path == '/user/login') ? '/user' : $current_path;

    // The destination could contain query parameters. Ensure that they are
    // preserved.
    $query = $this->requestStack->getCurrentRequest()->getQueryString();

    $_SESSION['openid_connect_destination'] = [
      $path,
      [
        'query' => $query,
      ],
    ];
  }

}
