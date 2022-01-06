<?php

namespace Drupal\openid_connect;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Extension\ModuleHandler;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Drupal\user\UserDataInterface;
use Drupal\user\UserInterface;
use Drupal\Component\Utility\EmailValidatorInterface;

/**
 * Main service of the OpenID Connect module.
 */
class OpenIDConnect {
  use StringTranslationTrait;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The OpenID Connect authmap service.
   *
   * @var \Drupal\openid_connect\OpenIDConnectAuthmap
   */
  protected $authmap;

  /**
   * The entity field manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * The user data service.
   *
   * @var \Drupal\user\UserDataInterface
   */
  protected $userData;

  /**
   * The User entity storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $userStorage;

  /**
   * The Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandler
   */
  protected $moduleHandler;

  /**
   * The email validator service.
   *
   * @var \Drupal\Component\Utility\EmailValidatorInterface
   */
  protected $emailValidator;

  /**
   * The OpenID Connect logger channel.
   *
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;

  /**
   * File system.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  private $fileSystem;

  /**
   * Construct an instance of the OpenID Connect service.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\openid_connect\OpenIDConnectAuthmap $authmap
   *   The OpenID Connect authmap service.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity manager.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entity_field_manager
   *   The entity field manager.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   Account proxy for the currently logged-in user.
   * @param \Drupal\user\UserDataInterface $user_data
   *   The user data service.
   * @param \Drupal\Component\Utility\EmailValidatorInterface $email_validator
   *   The email validator service.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger service.
   * @param \Drupal\Core\Extension\ModuleHandler $module_handler
   *   The module handler.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger
   *   A logger channel factory instance.
   * @param \Drupal\Core\File\FileSystemInterface $fileSystem
   *   The file system service.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    OpenIDConnectAuthmap $authmap,
    EntityTypeManagerInterface $entity_type_manager,
    EntityFieldManagerInterface $entity_field_manager,
    AccountProxyInterface $current_user,
    UserDataInterface $user_data,
    EmailValidatorInterface $email_validator,
    MessengerInterface $messenger,
    ModuleHandler $module_handler,
    LoggerChannelFactoryInterface $logger,
    FileSystemInterface $fileSystem
  ) {
    $this->configFactory = $config_factory;
    $this->authmap = $authmap;
    $this->userStorage = $entity_type_manager->getStorage('user');
    $this->entityFieldManager = $entity_field_manager;
    $this->currentUser = $current_user;
    $this->userData = $user_data;
    $this->emailValidator = $email_validator;
    $this->messenger = $messenger;
    $this->moduleHandler = $module_handler;
    $this->logger = $logger->get('openid_connect');
    $this->fileSystem = $fileSystem;
  }

  /**
   * Return user properties that can be ignored when mapping user profile info.
   *
   * @param array $context
   *   Optional: Array with context information, if this function is called
   *   within the context of user authorization.
   *   Defaults to an empty array.
   */
  public function userPropertiesIgnore(array $context = []) {
    $properties_ignore = [
      'uid',
      'uuid',
      'langcode',
      'preferred_langcode',
      'preferred_admin_langcode',
      'name',
      'pass',
      'mail',
      'status',
      'created',
      'changed',
      'access',
      'login',
      'init',
      'roles',
      'default_langcode',
    ];
    $this->moduleHandler->alter('openid_connect_user_properties_ignore', $properties_ignore, $context);
    // Invoke deprecated hook with deprecation error message.
    $this->moduleHandler->alterDeprecated('hook_openid_connect_user_properties_to_skip_alter() is deprecated and will be removed in 8.x-2.0.', 'openid_connect_user_properties_to_skip', $properties_ignore, $context);

    $properties_ignore = array_unique($properties_ignore);
    return array_combine($properties_ignore, $properties_ignore);
  }

  /**
   * Get the 'sub' property from the user data and/or user claims.
   *
   * The 'sub' (Subject Identifier) is a unique ID for the external provider to
   * identify the user.
   *
   * @param array|null $user_data
   *   The user data from OpenIDConnectClientInterface::decodeIdToken().
   * @param array|null $userinfo
   *   The user claims from OpenIDConnectClientInterface::retrieveUserInfo().
   *
   * @return string|false
   *   The sub, or FALSE if there was an error.
   */
  public function extractSub($user_data, $userinfo) {
    if (isset($user_data) && isset($user_data['sub'])) {
      // If we have sub in both $user_data and $userinfo, return FALSE if they
      // differ. Otherwise return the one in $user_data.
      return (!isset($userinfo['sub']) || ($user_data['sub'] == $userinfo['sub'])) ? $user_data['sub'] : FALSE;
    }
    else {
      // No sub in $user_data, return from $userinfo if it exists.
      return (isset($userinfo['sub'])) ? $userinfo['sub'] : FALSE;
    }
  }

  /**
   * Fill the context array.
   *
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client
   *   The client.
   * @param array $tokens
   *   The tokens as returned by OpenIDConnectClientInterface::retrieveTokens().
   *
   * @return array|bool
   *   Context array or FALSE if an error was raised.
   */
  private function buildContext(OpenIDConnectClientInterface $client, array $tokens) {
    $user_data = $client->decodeIdToken($tokens['id_token']);
    $userinfo = $client->retrieveUserInfo($tokens['access_token']);
    $provider = $client->getPluginId();

    $context = [
      'tokens' => $tokens,
      'plugin_id' => $provider,
      'user_data' => $user_data,
    ];
    $this->moduleHandler->alter('openid_connect_userinfo', $userinfo, $context);

    // Whether we have no usable user information.
    if (empty($user_data) && empty($userinfo)) {
      $this->logger->error('No user information provided by @provider (@code @error). Details: @details', ['@provider' => $provider]);
      return FALSE;
    }

    if ($userinfo && empty($userinfo['email'])) {
      $this->logger->error('No e-mail address provided by @provider (@code @error). Details: @details', ['@provider' => $provider]);
      return FALSE;
    }

    $sub = $this->extractSub($user_data, $userinfo);
    if (empty($sub)) {
      $this->logger->error('No "sub" found from @provider (@code @error). Details: @details', ['@provider' => $provider]);
      return FALSE;
    }

    /** @var \Drupal\user\UserInterface|bool $account */
    $account = $this->authmap->userLoadBySub($sub, $provider);
    $context = [
      'tokens' => $tokens,
      'plugin_id' => $provider,
      'user_data' => $user_data,
      'userinfo' => $userinfo,
      'sub' => $sub,
      'account' => $account,
    ];
    $results = $this->moduleHandler->invokeAll('openid_connect_pre_authorize', [
      $account,
      $context,
    ]);

    // Deny access if any module returns FALSE.
    if (in_array(FALSE, $results, TRUE)) {
      $this->logger->error('Login denied for @email via pre-authorize hook.', ['@email' => $userinfo['email']]);
      return FALSE;
    }

    // If any module returns an account, set local $account to that.
    foreach ($results as $result) {
      if ($result instanceof UserInterface) {
        $context['account'] = $result;
        break;
      }
    }

    return $context;
  }

  /**
   * Complete the authorization after tokens have been retrieved.
   *
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client
   *   The client.
   * @param array $tokens
   *   The tokens as returned by OpenIDConnectClientInterface::retrieveTokens().
   * @param string|array $destination
   *   The path to redirect to after authorization.
   *
   * @return bool
   *   TRUE on success, FALSE on failure.
   */
  public function completeAuthorization(OpenIDConnectClientInterface $client, array $tokens, &$destination) {
    if ($this->currentUser->isAuthenticated()) {
      throw new \RuntimeException('User already logged in');
    }

    $context = $this->buildContext($client, $tokens);
    if ($context === FALSE) {
      return FALSE;
    }

    $account = $context['account'];
    if ($account !== FALSE) {
      // An existing account was found. Save user claims.
      if ($this->configFactory->get('openid_connect.settings')->get('always_save_userinfo')) {
        $this->saveUserinfo($account, $context + ['is_new' => FALSE]);
      }
    }
    else {
      // Check whether the e-mail address is valid.
      $email = $context['userinfo']['email'];
      if (!$this->emailValidator->isValid($email)) {
        $this->messenger->addError($this->t('The e-mail address is not valid: @email', [
          '@email' => $email,
        ]));
        return FALSE;
      }

      // Check whether there is an e-mail address conflict.
      $accounts = $this->userStorage->loadByProperties([
        'mail' => $email,
      ]);
      if ($accounts) {
        /** @var \Drupal\user\UserInterface|bool $account */
        $account = reset($accounts);
        $connect_existing_users = $this->configFactory->get('openid_connect.settings')
          ->get('connect_existing_users');
        if ($connect_existing_users) {
          // Connect existing user account with this sub.
          $this->authmap->createAssociation($account, $client->getPluginId(), $context['sub']);
        }
        else {
          $this->messenger->addError($this->t('The e-mail address is already taken: @email', [
            '@email' => $email,
          ]));
          return FALSE;
        }
      }

      // Check Drupal user register settings before saving.
      $register = $this->configFactory->get('user.settings')
        ->get('register');
      // Respect possible override from OpenID-Connect settings.
      $register_override = $this->configFactory->get('openid_connect.settings')
        ->get('override_registration_settings');
      if ($register === UserInterface::REGISTER_ADMINISTRATORS_ONLY && $register_override) {
        $register = UserInterface::REGISTER_VISITORS;
      }

      if (empty($account)) {
        switch ($register) {
          case UserInterface::REGISTER_ADMINISTRATORS_ONLY:
            // Deny user registration.
            $this->messenger->addError($this->t('Only administrators can register new accounts.'));
            return FALSE;

          case UserInterface::REGISTER_VISITORS:
            // Create a new account if register settings is set to visitors or
            // override is active.
            $account = $this->createUser($context['sub'], $context['userinfo'], $client->getPluginId(), 1);
            break;

          case UserInterface::REGISTER_VISITORS_ADMINISTRATIVE_APPROVAL:
            // Create a new account and inform the user of the pending approval.
            $account = $this->createUser($context['sub'], $context['userinfo'], $client->getPluginId(), 0);
            $this->messenger->addMessage($this->t('Thank you for applying for an account. Your account is currently pending approval by the site administrator.'));
            break;
        }
      }

      // Store the newly created account.
      $this->saveUserinfo($account, $context + ['is_new' => TRUE]);
      $this->authmap->createAssociation($account, $client->getPluginId(), $context['sub']);
    }

    // Whether the user should not be logged in due to pending administrator
    // approval.
    if ($account->isBlocked()) {
      if (empty($context['is_new'])) {
        $this->messenger->addError($this->t('The username %name has not been activated or is blocked.', [
          '%name' => $account->getAccountName(),
        ]));
      }
      return FALSE;
    }

    $this->loginUser($account);

    $this->moduleHandler->invokeAll(
      'openid_connect_post_authorize',
      [
        $account,
        $context,
      ]
    );

    return TRUE;
  }

  /**
   * Connect the current user's account to an external provider.
   *
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientInterface $client
   *   The client.
   * @param array $tokens
   *   The tokens as returned from
   *   OpenIDConnectClientInterface::retrieveTokens().
   *
   * @return bool
   *   TRUE on success, FALSE on failure.
   */
  public function connectCurrentUser(OpenIDConnectClientInterface $client, array $tokens) {
    if (!$this->currentUser->isAuthenticated()) {
      throw new \RuntimeException('User not logged in');
    }

    $context = $this->buildContext($client, $tokens);
    if ($context === FALSE) {
      return FALSE;
    }

    $account = $context['account'];
    if ($account !== FALSE && $account->id() !== $this->currentUser->id()) {
      $this->messenger->addError($this->t('Another user is already connected to this @provider account.', ['@provider' => $client->getPluginId()]));
      return FALSE;
    }

    if ($account === FALSE) {
      $account = $this->userStorage->load($this->currentUser->id());
      $this->authmap->createAssociation($account, $client->getPluginId(), $context['sub']);
    }

    $always_save_userinfo = $this->configFactory->get('openid_connect.settings')->get('always_save_userinfo');
    if ($always_save_userinfo) {
      $this->saveUserinfo($account, $context);
    }

    $this->moduleHandler->invokeAll(
      'openid_connect_post_authorize',
      [
        $account,
        $context,
      ]
    );

    return TRUE;
  }

  /**
   * Find whether a user is allowed to change the own password.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   Optional: Account to check the access for.
   *   Defaults to the currently logged-in user.
   *
   * @return bool
   *   TRUE if access is granted, FALSE otherwise.
   */
  public function hasSetPasswordAccess(AccountInterface $account = NULL) {
    if (empty($account)) {
      $account = $this->currentUser;
    }

    if ($account->hasPermission('openid connect set own password')) {
      return TRUE;
    }

    $connected_accounts = $this->authmap->getConnectedAccounts($account);

    return empty($connected_accounts);
  }

  /**
   * Create a user indicating sub-id and login provider.
   *
   * @param string $sub
   *   The subject identifier.
   * @param array $userinfo
   *   The user claims, containing at least 'email'.
   * @param string $client_name
   *   The machine name of the client.
   * @param int $status
   *   The initial user status.
   *
   * @return \Drupal\user\UserInterface|false
   *   The user object or FALSE on failure.
   */
  public function createUser($sub, array $userinfo, $client_name, $status = 1) {
    /** @var \Drupal\user\UserInterface $account */
    $account = $this->userStorage->create([
      'name' => $this->generateUsername($sub, $userinfo, $client_name),
      'pass' => user_password(),
      'mail' => $userinfo['email'],
      'init' => $userinfo['email'],
      'status' => $status,
      'openid_connect_client' => $client_name,
      'openid_connect_sub' => $sub,
    ]);
    $account->save();

    return $account;
  }

  /**
   * Log in a user.
   *
   * @param \Drupal\user\UserInterface $account
   *   The user account to login.
   */
  protected function loginUser(UserInterface $account) {
    user_login_finalize($account);
  }

  /**
   * Generate a username for a new account.
   *
   * @param string $sub
   *   The subject identifier.
   * @param array $userinfo
   *   The user claims.
   * @param string $client_name
   *   The client identifier.
   *
   * @return string
   *   A unique username.
   */
  public function generateUsername($sub, array $userinfo, $client_name) {
    $name = 'oidc_' . $client_name . '_' . md5($sub);
    $candidates = ['preferred_username', 'name'];
    foreach ($candidates as $candidate) {
      if (!empty($userinfo[$candidate])) {
        $name = trim($userinfo[$candidate]);
        break;
      }
    }

    // Ensure there are no duplicates.
    for ($original = $name, $i = 1; $this->usernameExists($name); $i++) {
      $name = $original . '_' . $i;
    }

    return $name;
  }

  /**
   * Check if a user name already exists.
   *
   * @param string $name
   *   A name to test.
   *
   * @return bool
   *   TRUE if a user exists with the given name, FALSE otherwise.
   */
  public function usernameExists($name) {
    $users = $this->userStorage->loadByProperties([
      'name' => $name,
    ]);

    return (bool) $users;
  }

  /**
   * Save user profile information into a user account.
   *
   * @param \Drupal\user\UserInterface $account
   *   An user account object.
   * @param array $context
   *   An associative array with context information:
   *   - tokens:         An array of tokens.
   *   - user_data:      An array of user and session data.
   *   - userinfo:       An array of user information.
   *   - plugin_id:      The plugin identifier.
   *   - sub:            The remote user identifier.
   */
  public function saveUserinfo(UserInterface $account, array $context) {
    $userinfo = $context['userinfo'];
    $properties = $this->entityFieldManager->getFieldDefinitions('user', 'user');
    $properties_skip = $this->userPropertiesIgnore($context);
    foreach ($properties as $property_name => $property) {
      if (isset($properties_skip[$property_name])) {
        continue;
      }

      $userinfo_mappings = $this->configFactory->get('openid_connect.settings')
        ->get('userinfo_mappings');
      if (isset($userinfo_mappings[$property_name])) {
        $claim = $userinfo_mappings[$property_name];

        if ($claim && isset($userinfo[$claim])) {
          $claim_value = $userinfo[$claim];
          $property_type = $property->getType();

          $claim_context = $context + [
            'claim' => $claim,
            'property_name' => $property_name,
            'property_type' => $property_type,
            'userinfo_mappings' => $userinfo_mappings,
          ];
          $this->moduleHandler->alter(
            'openid_connect_userinfo_claim',
            $claim_value,
            $claim_context
          );

          // Set the user property, while ignoring exceptions from invalid
          // values.
          try {
            switch ($property_type) {
              case 'string':
              case 'string_long':
              case 'list_string':
              case 'datetime':
                $account->set($property_name, $claim_value);
                break;

              case 'boolean':
                $account->set($property_name, !empty($claim_value));
                break;

              case 'image':
                // Create file object from remote URL.
                $basename = explode('?', $this->fileSystem->basename($claim_value))[0];
                $data = file_get_contents($claim_value);

                $file = file_save_data(
                  $data,
                  'public://user-picture-' . $account->id() . '-' . $basename,
                  FileSystemInterface::EXISTS_RENAME
                );

                // Cleanup the old file.
                if ($file) {
                  $old_file = $account->$property_name->entity;
                  if ($old_file) {
                    $old_file->delete();
                  }
                }

                $account->set(
                  $property_name,
                  [
                    'target_id' => $file->id(),
                  ]
                );
                break;

              default:
                $this->logger->error(
                  'Could not save user info, property type not implemented: %property_type',
                  [
                    '%property_type' => $property_type,
                  ]
                );
                break;

            }
          }
          // Catch the error if the field does not exist.
          catch (\InvalidArgumentException $e) {
            $this->logger->error($e->getMessage());
          }
        }
      }
    }

    // Save the display name additionally in the user account 'data', for
    // use in openid_connect_username_alter().
    if (isset($userinfo['name'])) {
      $this->userData->set('openid_connect', $account->id(), 'oidc_name', $userinfo['name']);
    }

    // Allow other modules to add additional user information.
    $this->moduleHandler->invokeAllDeprecated('openid_connect_save_userinfo() is deprecated and will be removed in 8.x-2.0.', 'openid_connect_save_userinfo', [
      $account,
      $context,
    ]);
    $this->moduleHandler->invokeAll('openid_connect_userinfo_save', [
      $account,
      $context,
    ]);

    $account->save();
  }

}
