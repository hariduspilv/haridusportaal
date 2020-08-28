<?php

namespace Drupal\openid_connect;

use Drupal\Component\Utility\Crypt;

/**
 * Class OpenIDConnectStateToken.
 *
 * @package Drupal\openid_connect
 */
class OpenIDConnectStateToken {

  /**
   * Creates a state token and stores it in the session for later validation.
   *
   * @return string
   *   A state token that later can be validated to prevent request forgery.
   */
  public static function create() {
    $state = Crypt::randomBytesBase64();
    $_SESSION['openid_connect_state'] = $state;
    return $state;
  }

  /**
   * Confirms anti-forgery state token.
   *
   * @param string $state_token
   *   The state token that is used for validation.
   *
   * @return bool
   *   Whether the state token matches the previously created one that is stored
   *   in the session.
   */
  public static function confirm($state_token) {
    return isset($_SESSION['openid_connect_state']) &&
      $state_token == $_SESSION['openid_connect_state'];
  }

}
