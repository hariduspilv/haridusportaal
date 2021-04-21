<?php

namespace Drupal\openid_connect;

use Drupal\Component\Utility\Crypt;

/**
 * Creates and validates state tokens.
 *
 * @package Drupal\openid_connect
 */
class OpenIDConnectStateToken implements OpenIDConnectStateTokenInterface {

  /**
   * {@inheritdoc}
   */
  public static function create() {
    $state = Crypt::randomBytesBase64();
    $_SESSION['openid_connect_state'] = $state;
    return $state;
  }

  /**
   * {@inheritdoc}
   */
  public static function confirm($state_token) {
    return isset($_SESSION['openid_connect_state']) &&
      $state_token == $_SESSION['openid_connect_state'];
  }

}
