<?php

namespace Drupal\openid_connect;

use Drupal\Component\Utility\Crypt;

/**
 * Class StateToken.
 *
 * @package Drupal\openid_connect
 */
class StateToken {

  /**
   * Creates a state token and stores it in the session for later validation.
   *
   * @return string
   *   A state token that later can be validated to prevent request forgery.
   */
  public static function create() {
    $state = Crypt::randomBytesBase64();
    $session = \Drupal::request()->getSession();
    $session->set('openid_connect_state', $state);
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
    $session = \Drupal::request()->getSession();
    $session_token = $session->get('openid_connect_state');
    \Drupal::logger('htm_custom_tara_authentication')->notice('current session state: '.$session_token);
    return $state_token == $session_token;
  }

}
