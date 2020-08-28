<?php

/**
 * @file
 * Documentation for OpenID Connect module APIs.
 */

/* @noinspection PhpUnused */

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
 * Alter the OpenID Connect client plugins information.
 *
 * This hook is called after all OpenID Connect client plugins were
 * discovered.
 *
 * Popular use cases for this hook are programmatically adding plugin
 * definitions or overriding methods of existing plugins by changing their
 * plugin class to a custom class.
 *
 * @param array $client_info
 *   An array of client information.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_client_info_alter(array &$client_info) {
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
 * Alter the user properties to be ignored for mapping.
 *
 * This hook is called before OpenID Connect maps the user information from the
 * identity provider with the Drupal user account.
 *
 * A popular use for this hook is to prevent properties from being mapped for
 * certain identity providers.
 *
 * @param array $properties_to_skip
 *   An array of of properties to skip.
 * @param array $context
 *   An empty array for the OpenID Connect settings form, or an associative
 *   array with context information, if the hook is invoked during user
 *   authorization:
 *   - tokens:         An array of tokens.
 *   - user_data:      An array of user and session data from the ID token.
 *   - userinfo:       An array of user information from the userinfo endpoint.
 *   - plugin_id:      The plugin identifier.
 *   - sub:            The remote user identifier.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_user_properties_ignore_alter(array &$properties_to_skip, array $context) {
  // Allow to map the username to a property from the provider.
  if ($context['plugin_id'] == 'generic') {
    unset($properties_to_skip['name']);
  }
}

/**
 * Alter the user information provided by the identity provider.
 *
 * This hook is called after the user information has been fetched from the
 * identity provider's userinfo endpoint, and before authorization or
 * connecting a user takes place.
 *
 * Popular use cases for this hook are providing additional user information,
 * or 'translating' information from a format used by the identity provider
 * to a format that can be used by the OpenID Connect claim mapping.
 *
 * @param array $userinfo
 *   Array of returned user information from the identity provider.
 * @param array $context
 *   An associative array with context information:
 *   - tokens:      An array of tokens.
 *   - user_data:   An array of user and session information from the ID token.
 *   - plugin_id:   The plugin identifier.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_userinfo_alter(array &$userinfo, array $context) {
  // Add some custom information.
  if ($context['plugin_id'] == 'generic') {
    $userinfo['my_info'] = [
      'full_name' => $userinfo['first_name'] . ' ' . $userinfo['last_name'],
      'remarks' => 'Information provided by generic client plugin.',
    ];
  }
}

/**
 * OpenID Connect pre authorize hook.
 *
 * This hook runs before a user is authorized and before any claim mappings
 * take place.
 *
 * Popular use cases for this hook are overriding the user account that shall
 * be authorized, or checking certain constraints before authorization and
 * distinctively allowing/denying authorization for the given account.
 *
 * @param \Drupal\user\UserInterface|bool $account
 *   User account identified using the "sub" provided by the identity provider,
 *   or FALSE, if no such account exists.
 * @param array $context
 *   An associative array with context information:
 *   - tokens:         An array of tokens.
 *   - user_data:      An array of user and session data.
 *   - userinfo:       An array of user information.
 *   - plugin_id:      The plugin identifier.
 *   - sub:            The remote user identifier.
 *
 * @return \Drupal\user\UserInterface|false
 *   A user account for a certain user to authorize, FALSE, if the user shall
 *   not be logged in, or TRUE for successful hook execution.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_pre_authorize($account, array $context) {
  // Allow access only for users with the role 'elevated'.
  if (($account && $account->hasRole('elevated')) || (
    $context['plugin_id'] == 'generic'
    && isset($context['userinfo']['roles'])
    && in_array('elevated', $context['userinfo']['roles'])
  )) {
    return TRUE;
  }

  // Deny all other users.
  return FALSE;
}

/**
 * OpenID Connect post authorize hook.
 *
 * This hook runs after a user has been authorized and claims have been mapped
 * to the user's account.
 *
 * A popular use case for this hook is to saving token and additional identity
 * provider related information to the user's Drupal session (private temp
 * store).
 *
 * @param \Drupal\user\UserInterface $account
 *   User account object of the authorized user.
 * @param array $context
 *   An associative array with context information:
 *   - tokens:         An array of tokens.
 *   - user_data:      An array of user and session data.
 *   - userinfo:       An array of user information.
 *   - plugin_id:      The plugin identifier.
 *   - sub:            The remote user identifier.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_post_authorize(UserInterface $account, array $context) {
}

/**
 * Userinfo claim alter hook.
 *
 * This hook runs for every IdP provided userinfo claim mapped to a user
 * property, just before the OpenID Connect module maps its value to the
 * user property.
 *
 * A popular use for this hook is preprocessing claim values from a certain
 * IdP to match the property type of the target user property.
 *
 * @param mixed $claim_value
 *   The claim value.
 * @param array $context
 *   An context array containing:
 *   - claim:            The current claim.
 *   - property_name:    The property the claim is mapped to.
 *   - property_type:    The property type the claim is mapped to.
 *   - userinfo_mapping: The complete userinfo mapping.
 *   - tokens:           Array of original tokens.
 *   - user_data:        Array of user and session data from the ID token.
 *   - userinfo:         Array of user information from the userinfo endpoint.
 *   - plugin_id:        The plugin identifier.
 *   - sub:              The remote user identifier.
 *   - is_new:           Whether the account was created during authorization.
 */
function hook_openid_connect_userinfo_claim_alter(&$claim_value, array $context) {
  // Alter only, when the claim comes from the 'generic' identiy provider and
  // the property is 'telephone'.
  if (
    $context['plugin_id'] != 'generic'
    || $context['property_name'] != 'telephone'
  ) {
    return;
  }

  // Replace international number indicator with double zero.
  str_replace('+', '00', $claim_value);
}

/**
 * Save userinfo hook.
 *
 * This hook runs after the claim mappings have been applied by the OpenID
 * Connect module, but before the account will be saved.
 *
 * A popular use case for this hook is mapping additional information like
 * user roles or other complex claims provided by the identity provider, that
 * the OpenID Connect module has no mapping mechanisms for.
 *
 * @param \Drupal\user\UserInterface $account
 *   A user account object.
 * @param array $context
 *   An associative array with context information:
 *   - tokens:         Array of original tokens.
 *   - user_data:      Array of user and session data from the ID token.
 *   - userinfo:       Array of user information from the userinfo endpoint.
 *   - plugin_id:      The plugin identifier.
 *   - sub:            The remote user identifier.
 *   - is_new:         Whether the account was created during authorization.
 *
 * @ingroup openid_connect_api
 */
function hook_openid_connect_userinfo_save(UserInterface $account, array $context) {
  // Update only when the required information is available.
  if (
    $context['plugin_id'] != 'generic'
    || empty($context['userinfo']['my_info'])
  ) {
    return;
  }

  // Note: For brevity, this example does not validate field
  // types, nor does it implement error handling.
  $my_info = $context['userinfo']['my_info'];
  foreach ($my_info as $key => $value) {
    $account->set('field_' . $key, $value);
  }
}

/**
 * Save userinfo hook.
 *
 * This hook runs after the claim mappings have been applied by the OpenID
 * Connect module, but before the account will be saved.
 *
 * A popular use case for this hook is mapping additional information like
 * user roles or other complex claims provided by the identity provider, that
 * the OpenID Connect module has no mapping mechanisms for.
 *
 * @param \Drupal\user\UserInterface $account
 *   A user account object.
 * @param array $context
 *   An associative array with context information:
 *   - tokens:         Array of original tokens.
 *   - user_data:      Array of user and session data from the ID token.
 *   - userinfo:       Array of user information from the userinfo endpoint.
 *   - plugin_id:      The plugin identifier.
 *   - sub:            The remote user identifier.
 *   - is_new:         Whether the account was created during authorization.
 *
 * @ingroup openid_connect_api
 * @deprecated in openid_connect:8.x-1.0-beta6 and is removed from openid_connect:8.x-2.0.
 *   Use hook_openid_connect_userinfo_save() instead.
 * @see https://www.drupal.org/project/openid_connect/issues/2912214
 */
function hook_openid_connect_save_userinfo(UserInterface $account, array $context) {
}

/**
 * Alter hook to alter the user properties to be skipped for mapping.
 *
 * @param array $properties_to_skip
 *   An array of of properties to skip.
 *
 * @ingroup openid_connect_api
 * @deprecated in openid_connect:8.x-1.0-beta6 and is removed from openid_connect:8.x-2.0.
 *   Use hook_openid_connect_user_properties_ignore_alter() instead.
 * @see https://www.drupal.org/project/openid_connect/issues/2921095
 */
function hook_openid_connect_user_properties_to_skip_alter(array &$properties_to_skip) {
}
