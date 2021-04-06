<?php

namespace Drupal\openid_connect\Plugin;

use Drupal\Component\Plugin\ConfigurableInterface;
use Drupal\Component\Plugin\DependentPluginInterface;
use Drupal\Component\Plugin\PluginInspectionInterface;
use Drupal\Core\Plugin\PluginFormInterface;

/**
 * Defines an interface for OpenID Connect client plugins.
 */
interface OpenIDConnectClientInterface extends ConfigurableInterface, DependentPluginInterface, PluginFormInterface, PluginInspectionInterface {

  /**
   * Returns an array of endpoints.
   *
   * @return array
   *   An array with the following keys:
   *   - authorization: The full url to the authorization endpoint.
   *   - token: The full url to the token endpoint.
   *   - userinfo: The full url to the userinfo endpoint.
   */
  public function getEndpoints();

  /**
   * Gets an array of of scopes.
   *
   * This method allows a client to override the default minimum set of scopes
   * assumed by OpenIDConnectClaims::getScopes();
   *
   * @return string[]|null
   *   A space separated list of scopes.
   */
  public function getClientScopes();

  /**
   * Redirects the user to the authorization endpoint.
   *
   * The authorization endpoint authenticates the user and returns them
   * to the redirect_uri specified previously with an authorization code
   * that can be exchanged for an access token.
   *
   * @param string $scope
   *   Name of scope(s) that with user consent will provide access to otherwise
   *   restricted user data. Defaults to "openid email".
   *
   * @return \Symfony\Component\HttpFoundation\Response
   *   A response object.
   */
  public function authorize($scope = 'openid email');

  /**
   * Retrieve access token and ID token.
   *
   * Exchanging the authorization code that is received as the result of the
   * authentication request for an access token and an ID token.
   *
   * The ID token is a cryptographically signed JSON object encoded in base64.
   * It contains identity information about the user.
   * The access token can be sent to the login provider to obtain user profile
   * information.
   *
   * @param string $authorization_code
   *   Authorization code received as a result of the the authorization request.
   *
   * @return array|bool
   *   An associative array containing:
   *   - id_token: The ID token that holds user data.
   *   - access_token: Access token that can be used to obtain user profile
   *     information.
   *   - expire: Unix timestamp of the expiration date of the access token.
   *   Or FALSE if tokens could not be retrieved.
   */
  public function retrieveTokens($authorization_code);

  /**
   * Decodes ID token to access user data.
   *
   * @param string $id_token
   *   The encoded ID token containing the user data.
   *
   * @return array
   *   User identity information.
   */
  public function decodeIdToken($id_token);

  /**
   * Retrieves user info: additional user profile data.
   *
   * @param string $access_token
   *   Access token.
   *
   * @return array|bool
   *   User profile information array, or FALSE if retrieval failed.
   */
  public function retrieveUserInfo($access_token);

}
