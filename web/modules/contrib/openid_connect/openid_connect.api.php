<?php

/**
 * @file
 * Documentation for OpenID Connect module APIs.
 */

use Drupal\user\UserInterface;

/**
 * Modify the list of claims.
 *
 * @param array $claims
 *   A array of claims.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_claims_alter(array &$claims) {
  $claims['custom_claim'] = [
    'scope' => 'profile',
    'title' => 'Custom Claim',
    'type' => 'string',
    'description' => 'A custom claim from provider',
  ];
}

/**
 * Alter hook to alter OpenID Connect client plugins.
 *
 * @param array $client_info
 *   An array of client information.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_openid_connect_client_info_alter(array &$client_info) {
  $client_info['generic'] = [
    'id' => 'generic',
    'label' => [
      'string' => 'Generic',
      'translatableMarkup' => NULL,
      'options' => [],
      'stringTranslation' => NULL,
      'arguments' => [],
    ],
    'class' => 'Drupal\openid_connect\Plugin\OpenIDConnectClient\Generic',
    'provider' => 'openid_connect',
  ];
}

/**
 * Alter hook to alter the user properties to be skipped for mapping.
 *
 * @param array $properties_to_skip
 *   An array of of properties to skip.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_user_properties_to_skip_alter(array &$properties_to_skip) {
  // Allow to map the username to a property from the provider.
  unset($properties_to_skip['name']);
}

/**
 * Alter hook to alter userinfo before authorization or connecting a user.
 *
 * @param array $userinfo
 *   An array of returned user information.
 * @param array $context
 *   - user_data: An array of user_data.
 */
function hook_openid_connect_userinfo_alter(array &$userinfo, array $context) {
}

/**
 * Post authorize hook that runs after the user logged in via OpenID Connect.
 *
 * @param array $tokens
 *   An array of tokens.
 * @param \Drupal\user\UserInterface $account
 *   A user account object.
 * @param array $userinfo
 *   An array of user information.
 * @param string $plugin_id
 *   The plugin identifier.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_post_authorize(array $tokens, UserInterface $account, array $userinfo, $plugin_id) {
}

/**
 * Pre authorize hook that runs before a user is authorized.
 *
 * @param array $tokens
 *   An array of tokens.
 * @param \Drupal\user\UserInterface $account
 *   A user account object.
 * @param array $userinfo
 *   An array of user information.
 * @param string $plugin_id
 *   The plugin identifier.
 * @param string $sub
 *   The remote user identifier.
 */
function hook_openid_connect_pre_authorize(array $tokens, UserInterface $account, array $userinfo, $plugin_id, $sub) {
}
