<?php

namespace Drupal\openid_connect;

/**
 * Creates and validates state tokens.
 *
 * @package Drupal\openid_connect
 */
interface OpenIDConnectStateTokenInterface {

  /**
   * Creates a state token and stores it in the session for later validation.
   *
   * @return string
   *   A state token that later can be validated to prevent request forgery.
   *
   * @deprecated in openid_connect:8.x-1.0-rc2 and is removed from openid_connect:8.x-2.0.
   *   Instead of the static OpenIDConnectStateToken::create, use the non-static
   *   \Drupal::service('openid_connect.state_token')->create() instead.
   * @see https://www.drupal.org/project/openid_connect/issues/3055847
   */
  public static function create();

  /**
   * Confirms anti-forgery state token.
   *
   * @param string $state_token
   *   The state token that is used for validation.
   *
   * @return bool
   *   Whether the state token matches the previously created one that is stored
   *   in the session.
   *
   * @deprecated in openid_connect:8.x-1.0-rc2 and is removed from openid_connect:8.x-2.0.
   *   Instead of the static OpenIDConnectStateToken::confirm use the non-static
   *   \Drupal::service('openid_connect.state_token')->confirm() instead.
   * @see https://www.drupal.org/project/openid_connect/issues/3055847
   */
  public static function confirm($state_token);

}
