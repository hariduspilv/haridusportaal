<?php

namespace Drupal\users_jwt\PageCache;

use Drupal\Core\PageCache\RequestPolicyInterface;
use Drupal\users_jwt\Authentication\Provider\UsersJwtAuth;
use Symfony\Component\HttpFoundation\Request;

/**
 * Cache policy for pages served from JWT auth.
 *
 * This policy disallows caching of requests that use users_jwt_auth.
 * Otherwise, responses for authenticated requests can get into the
 * page cache and could be delivered to unprivileged users.
 */
class UsersJwtRequestPolicy implements RequestPolicyInterface {

  /**
   * {@inheritdoc}
   */
  public function check(Request $request) {
    if (UsersJwtAuth::getJwtFromRequest($request)) {
      return self::DENY;
    }

    return NULL;
  }

}
