<?php

declare(strict_types = 1);

namespace Drupal\Tests\openid_connect\Unit;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Extension\ModuleHandler;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\openid_connect\OpenIDConnectAuthmap;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Drupal\Tests\UnitTestCase;
use Drupal\user\Entity\User;
use Drupal\user\UserDataInterface;
use Drupal\openid_connect\OpenIDConnect;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\user\UserInterface;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\Logger\LoggerChannelInterface;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Entity\EntityTypeRepositoryInterface;
use Drupal\file\Entity\File;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileSystemInterface;
use Psr\Log\InvalidArgumentException;

/**
 * Provides tests for the OpenID Connect module.
 *
 * @coversDefaultClass \Drupal\openid_connect\OpenIDConnect
 * @group openid_connect
 */
class OpenIDConnectTest extends UnitTestCase {

  /**
   * Mock of the config factory.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $configFactory;

  /**
   * Mock of the OpenIDConnectAuthMap service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $authMap;

  /**
   * Mock of the entity_type.manager service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $entityTypeManager;

  /**
   * Mock of the entity field manager service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $entityFieldManager;

  /**
   * Mock of the account_proxy service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $currentUser;

  /**
   * Mock of the user data interface.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $userData;

  /**
   * Mock of the email validator.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $emailValidator;

  /**
   * Mock of the messenger service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $messenger;

  /**
   * Mock of the module handler service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $moduleHandler;

  /**
   * Mock of the logger interface.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $logger;

  /**
   * The OpenIDConnect class being tested.
   *
   * @var \Drupal\openid_connect\OpenIDConnect
   */
  protected $openIdConnect;

  /**
   * Mock of the userStorageInterface.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $userStorage;

  /**
   * Mock of the open id connect logger.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $oidcLogger;

  /**
   * Mock of the FileSystemInterface.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $fileSystem;

  /**
   * {@inheritDoc}
   */
  protected function setUp() {
    parent::setUp();

    $oldFileMock = $this->createMock(File::class);
    $oldFileMock->expects($this->any())
      ->method('id')
      ->willReturn(123);

    // Add this mock to the globals for the file_save_data fixture.
    $GLOBALS['oldFileMock'] = $oldFileMock;

    require_once 'UserPasswordFixture.php';

    // Mock the config_factory service.
    $this->configFactory = $this
      ->createMock(ConfigFactoryInterface::class);

    // Mock the authMap open id connect service.
    $this->authMap = $this
      ->createMock(OpenIDConnectAuthmap::class);

    $this->userStorage = $this
      ->createMock(EntityStorageInterface::class);

    // Mock the entity type manager service.
    $this->entityTypeManager = $this
      ->createMock(EntityTypeManagerInterface::class);

    $this->entityTypeManager->expects($this->atLeastOnce())
      ->method('getStorage')
      ->with('user')
      ->willReturn($this->userStorage);

    $this->entityFieldManager = $this
      ->createMock(EntityFieldManagerInterface::class);

    $this->currentUser = $this
      ->createMock(AccountProxyInterface::class);

    $this->userData = $this
      ->createMock(UserDataInterface::class);

    $emailValidator = $this
      ->getMockBuilder('\Drupal\Component\Utility\EmailValidator')
      ->setMethods(NULL);
    $this->emailValidator = $emailValidator->getMock();

    $this->messenger = $this
      ->createMock(MessengerInterface::class);

    $this->moduleHandler = $this
      ->createMock(ModuleHandler::class);

    $this->logger = $this
      ->createMock(LoggerChannelFactoryInterface::class);

    $this->oidcLogger = $this
      ->createMock(LoggerChannelInterface::class);

    $this->logger->expects($this->atLeastOnce())
      ->method('get')
      ->with('openid_connect')
      ->willReturn($this->oidcLogger);

    $this->fileSystem = $this
      ->createMock(FileSystemInterface::class);

    $container = new ContainerBuilder();
    $container->set('string_translation', $this->getStringTranslationStub());
    $container->set('entity_type.repository', $this->createMock(EntityTypeRepositoryInterface::class));
    $container->set('entity_type.manager', $this->createMock(EntityTypeManagerInterface::class));
    \Drupal::setContainer($container);

    $this->openIdConnect = new OpenIDConnect(
      $this->configFactory,
      $this->authMap,
      $this->entityTypeManager,
      $this->entityFieldManager,
      $this->currentUser,
      $this->userData,
      $this->emailValidator,
      $this->messenger,
      $this->moduleHandler,
      $this->logger,
      $this->fileSystem
    );
  }

  /**
   * Test for the userPropertiesIgnore method.
   */
  public function testUserPropertiesIgnore(): void {
    $defaultPropertiesIgnore = [
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
    $expectedResults = array_combine($defaultPropertiesIgnore, $defaultPropertiesIgnore);

    $this->moduleHandler->expects($this->once())
      ->method('alter')
      ->with(
        'openid_connect_user_properties_ignore',
        $defaultPropertiesIgnore,
        []
      );

    $this->moduleHandler->expects($this->once())
      ->method('alterDeprecated')
      ->with(
        'hook_openid_connect_user_properties_to_skip_alter() is deprecated and will be removed in 8.x-2.0.', 'openid_connect_user_properties_to_skip',
        $defaultPropertiesIgnore
      );

    $actualPropertiesIgnored = $this->openIdConnect->userPropertiesIgnore([]);

    $this->assertArrayEquals($expectedResults, $actualPropertiesIgnored);
  }

  /**
   * Test the extractSub method.
   *
   * @param array $userData
   *   The user data as returned from
   *   OpenIDConnectClientInterface::decodeIdToken().
   * @param array $userInfo
   *   The user claims as returned from
   *   OpenIDConnectClientInterface::retrieveUserInfo().
   * @param bool|string $expected
   *   The expected result from the test.
   *
   * @dataProvider dataProviderForExtractSub
   */
  public function testExtractSub(
    array $userData,
    array $userInfo,
    $expected
  ): void {
    $actual = $this->openIdConnect->extractSub($userData, $userInfo);
    $this->assertEquals($expected, $actual);
  }

  /**
   * Data provider for the testExtractSub method.
   *
   * @return array|array[]
   *   The array of tests for the method.
   */
  public function dataProviderForExtractSub(): array {
    $randomSub = $this->randomMachineName();
    return [
      [
        [],
        [],
        FALSE,
      ],
      [
        ['sub' => $randomSub],
        [],
        $randomSub,
      ],
      [
        [],
        ['sub' => $randomSub],
        $randomSub,
      ],
      [
        ['sub' => $this->randomMachineName()],
        ['sub' => $randomSub],
        FALSE,
      ],
    ];
  }

  /**
   * Test for the hasSetPassword method.
   *
   * @param \Drupal\Tests\openid_connect\Unit\MockObject|null $account
   *   The account to test or null if none provided.
   * @param bool $hasPermission
   *   Whether the account should have the correct permission
   *   to change their own password.
   * @param array $connectedAccounts
   *   The connected accounts array from the authMap method.
   * @param bool $expectedResult
   *   The result expected.
   *
   * @dataProvider dataProviderForHasSetPasswordAccess
   */
  public function testHasSetPasswordAccess(
    ?MockObject $account,
    bool $hasPermission,
    array $connectedAccounts,
    bool $expectedResult
  ): void {
    if (empty($account)) {
      $this->currentUser->expects($this->once())
        ->method('hasPermission')
        ->with('openid connect set own password')
        ->willReturn($hasPermission);

      if (!$hasPermission) {
        $this->authMap->expects($this->once())
          ->method('getConnectedAccounts')
          ->with($this->currentUser)
          ->willReturn($connectedAccounts);
      }
    }
    else {
      $account->expects($this->once())
        ->method('hasPermission')
        ->with('openid connect set own password')
        ->willReturn($hasPermission);

      if (!$hasPermission) {
        $this->authMap->expects($this->once())
          ->method('getConnectedAccounts')
          ->with($account)
          ->willReturn($connectedAccounts);
      }
    }

    $actualResult = $this->openIdConnect->hasSetPasswordAccess($account);

    $this->assertEquals($expectedResult, $actualResult);
  }

  /**
   * Data provider for the testHasSetPasswordAccess method.
   *
   * @return array|array[]
   *   Data provider parameters for the testHasSetPassword() method.
   */
  public function dataProviderForHasSetPasswordAccess(): array {
    $connectedAccounts = [
      $this->randomMachineName() => 'sub',
    ];

    return [
      [
        $this->currentUser, FALSE, [], TRUE,
      ],
      [
        $this->currentUser, TRUE, [], TRUE,
      ],
      [
        NULL, TRUE, [], TRUE,
      ],
      [
        NULL, FALSE, [], TRUE,
      ],
      [
        $this->currentUser, FALSE, $connectedAccounts, FALSE,
      ],
      [
        $this->currentUser, TRUE, $connectedAccounts, TRUE,
      ],
      [
        NULL, TRUE, $connectedAccounts, TRUE,
      ],
      [
        NULL, FALSE, $connectedAccounts, FALSE,
      ],
    ];
  }

  /**
   * Test for the createUser method.
   *
   * @param string $sub
   *   The sub to use.
   * @param array $userinfo
   *   The userinfo array containing the email key.
   * @param string $client_name
   *   The client name for the user.
   * @param bool $status
   *   The user status.
   * @param bool $duplicate
   *   Whether to test a duplicate username.
   *
   * @dataProvider dataProviderForCreateUser
   */
  public function testCreateUser(
    string $sub,
    array $userinfo,
    string $client_name,
    bool $status,
    bool $duplicate
  ): void {
    // Mock the expected username.
    $expectedUserName = 'oidc_' . $client_name . '_' . md5($sub);

    // If the preferred username is defined, use it instead.
    if (array_key_exists('preferred_username', $userinfo)) {
      $expectedUserName = trim($userinfo['preferred_username']);
    }

    // If the name key exists, use it.
    if (array_key_exists('name', $userinfo)) {
      $expectedUserName = trim($userinfo['name']);
    }

    $expectedAccountArray = [
      'name' => ($duplicate ? "{$expectedUserName}_1" : $expectedUserName),
      'pass' => 'TestPassword123',
      'mail' => $userinfo['email'],
      'init' => $userinfo['email'],
      'status' => $status,
      'openid_connect_client' => $client_name,
      'openid_connect_sub' => $sub,
    ];

    // Mock the user account to be created.
    $account = $this
      ->createMock(UserInterface::class);
    $account->expects($this->once())
      ->method('save')
      ->willReturn(1);

    $this->userStorage->expects($this->once())
      ->method('create')
      ->with($expectedAccountArray)
      ->willReturn($account);

    if ($duplicate) {
      $this->userStorage->expects($this->exactly(2))
        ->method('loadByProperties')
        ->withConsecutive(
          [['name' => $expectedUserName]],
          [['name' => "{$expectedUserName}_1"]]
        )
        ->willReturnOnConsecutiveCalls([1], []);
    }
    else {
      $this->userStorage->expects($this->once())
        ->method('loadByProperties')
        ->with(['name' => $expectedUserName])
        ->willReturn([]);
    }

    $actualResult = $this->openIdConnect
      ->createUser($sub, $userinfo, $client_name, $status);

    $this->assertInstanceOf('\Drupal\user\UserInterface', $actualResult);
  }

  /**
   * Data provider for the testCreateUser method.
   *
   * @return array|array[]
   *   The parameters to pass to testCreateUser().
   */
  public function dataProviderForCreateUser(): array {
    return [
      [
        $this->randomMachineName(),
        ['email' => 'test@123.com'],
        '',
        FALSE,
        FALSE,
      ],
      [
        $this->randomMachineName(),
        [
          'email' => 'test@test123.com',
          'name' => $this->randomMachineName(),
        ],
        $this->randomMachineName(),
        TRUE,
        FALSE,
      ],
      [
        $this->randomMachineName(),
        [
          'email' => 'test@test456.com',
          'preferred_username' => $this->randomMachineName(),
        ],
        $this->randomMachineName(),
        TRUE,
        TRUE,
      ],
    ];
  }

  /**
   * Test coverate for the completeAuthorization() method.
   *
   * @param bool $authenticated
   *   Should the user be authenticated.
   * @param string $destination
   *   Destination string.
   * @param array $tokens
   *   Tokens array.
   * @param array $userData
   *   The user data array.
   * @param array $userInfo
   *   The user info array.
   * @param bool $preAuthorize
   *   Whether to preauthorize or not.
   * @param bool $accountExists
   *   Does the account already exist.
   *
   * @dataProvider dataProviderForCompleteAuthorization
   * @runInSeparateProcess
   */
  public function testCompleteAuthorization(
    bool $authenticated,
    string $destination,
    array $tokens,
    array $userData,
    array $userInfo,
    bool $preAuthorize,
    bool $accountExists
  ): void {
    $clientPluginId = $this->randomMachineName();

    $this->currentUser->expects($this->once())
      ->method('isAuthenticated')
      ->willReturn($authenticated);

    $client = $this
      ->createMock(OpenIDConnectClientInterface::class);

    if ($authenticated) {
      $this->expectException('RuntimeException');
    }
    else {
      $client->expects($this->once())
        ->method('decodeIdToken')
        ->with($tokens['id_token'])
        ->willReturn($userData);

      $client->expects($this->once())
        ->method('retrieveUserInfo')
        ->with($tokens['access_token'])
        ->willReturn($userInfo);

      $client->expects($this->any())
        ->method('getPluginId')
        ->willReturn($clientPluginId);

      if ($accountExists) {
        if (!$preAuthorize) {
          $moduleHandlerResults = [1, 2, FALSE];
        }
        else {
          $returnedAccount = $this
            ->createMock(UserInterface::class);

          if (!empty($userInfo['blocked'])) {
            $returnedAccount->expects($this->once())
              ->method('isBlocked')
              ->willReturn(TRUE);

            $this->messenger->expects($this->once())
              ->method('addError');
          }

          $moduleHandlerResults = [$returnedAccount];
        }

        $this->moduleHandler->expects($this->once())
          ->method('alter')
          ->with(
            'openid_connect_userinfo',
            $userInfo,
            [
              'tokens' => $tokens,
              'plugin_id' => $clientPluginId,
              'user_data' => $userData,
            ]
          );

        if (empty($userData) && empty($userInfo)) {
          $this->oidcLogger->expects($this->once())
            ->method('error')
            ->with(
              'No user information provided by @provider (@code @error). Details: @details',
              ['@provider' => $clientPluginId]
            );
        }

        if (!empty($userInfo) && empty($userInfo['email'])) {
          $this->oidcLogger->expects($this->once())
            ->method('error')
            ->with(
              'No e-mail address provided by @provider (@code @error). Details: @details',
              ['@provider' => $clientPluginId]
            );
        }

        if (!empty($userInfo['sub'])) {
          $account = $this->createMock(UserInterface::class);
          $account->method('id')->willReturn(1234);
          $account->method('isNew')->willReturn(FALSE);

          $this->authMap->expects($this->once())
            ->method('userLoadBySub')
            ->willReturn($account);

          $this->moduleHandler->expects($this->any())
            ->method('invokeAll')
            ->withConsecutive(
              ['openid_connect_pre_authorize'],
              ['openid_connect_userinfo_save'],
              ['openid_connect_post_authorize']
            )
            ->willReturnOnConsecutiveCalls(
              $moduleHandlerResults,
              TRUE,
              TRUE
            );

          if ($preAuthorize) {
            $this->entityFieldManager->expects($this->once())
              ->method('getFieldDefinitions')
              ->with('user', 'user')
              ->willReturn(['mail' => 'mail']);

            $immutableConfig = $this
              ->createMock(ImmutableConfig::class);

            $immutableConfig->expects($this->exactly(2))
              ->method('get')
              ->withConsecutive(
                ['always_save_userinfo'],
                ['userinfo_mappings']
              )
              ->willReturnOnConsecutiveCalls(
                TRUE,
                ['mail', 'name']
              );

            $this->configFactory->expects($this->exactly(2))
              ->method('get')
              ->with('openid_connect.settings')
              ->willReturn($immutableConfig);
          }
        }
      }
      else {
        $account = FALSE;

        $this->authMap->expects($this->once())
          ->method('userLoadBySub')
          ->willReturn($account);

        $this->moduleHandler->expects($this->any())
          ->method('invokeAll')
          ->willReturnCallback(function (...$args) {
            $return = NULL;
            switch ($args[0]) {
              case 'openid_connect_pre_authorize':
                $return = [];
                break;

              default:
                $return = NULL;
                break;

            }
            return $return;
          });

        if ($userInfo['email'] === 'invalid') {
          $this->messenger->expects($this->once())
            ->method('addError');
        }
        else {
          if ($userInfo['email'] === 'duplicate@valid.com') {
            $account = $this
              ->createMock(UserInterface::class);

            $this->userStorage->expects($this->once())
              ->method('loadByProperties')
              ->with(['mail' => $userInfo['email']])
              ->willReturn([$account]);

            $immutableConfig = $this
              ->createMock(ImmutableConfig::class);

            $immutableConfig->expects($this->once())
              ->method('get')
              ->with('connect_existing_users')
              ->willReturn(FALSE);

            $this->configFactory->expects($this->once())
              ->method('get')
              ->with('openid_connect.settings')
              ->willReturn($immutableConfig);

            $this->messenger->expects($this->once())
              ->method('addError');
          }
          elseif ($userInfo['email'] === 'connect@valid.com') {
            $this->entityFieldManager->expects($this->any())
              ->method('getFieldDefinitions')
              ->with('user', 'user')
              ->willReturn(['mail' => 'mail']);

            $context = [
              'tokens' => $tokens,
              'plugin_id' => $clientPluginId,
              'user_data' => $userData,
            ];

            $this->moduleHandler->expects($this->once())
              ->method('alter')
              ->with(
                'openid_connect_userinfo',
                $userInfo,
                $context
              );

            if (isset($userInfo['newAccount']) && $userInfo['newAccount']) {
              $account = FALSE;
            }
            else {
              $account = $this
                ->createMock(UserInterface::class);

              if (isset($userInfo['blocked']) && $userInfo['blocked']) {
                $account->expects($this->once())
                  ->method('isBlocked')
                  ->willReturn(TRUE);

                if ($accountExists) {
                  $this->messenger->expects($this->once())
                    ->method('addError');
                }
              }
            }

            if (isset($userInfo['newAccount']) && $userInfo['newAccount']) {
              $this->userStorage->expects($this->once())
                ->method('loadByProperties')
                ->with(['mail' => $userInfo['email']])
                ->willReturn(FALSE);
            }
            else {
              $this->userStorage->expects($this->once())
                ->method('loadByProperties')
                ->with(['mail' => $userInfo['email']])
                ->willReturn([$account]);
            }

            if (isset($userInfo['register'])) {
              switch ($userInfo['register']) {
                case 'admin_only':
                  if (empty($userInfo['registerOverride'])) {
                    $this->messenger->expects($this->once())
                      ->method('addError');
                  }
                  break;

                case 'visitors_admin_approval':
                  $this->messenger->expects($this->once())
                    ->method('addMessage');
                  break;

              }

            }

            $immutableConfig = $this
              ->createMock(ImmutableConfig::class);

            $immutableConfig->expects($this->any())
              ->method('get')
              ->willReturnCallback(function ($config) use ($userInfo) {
                $return = FALSE;

                switch ($config) {
                  case 'connect_existing_users':
                  case 'override_registration_settings':
                    if (empty($userInfo['registerOverride']) && isset($userInfo['newAccount']) && $userInfo['newAccount']) {
                      $return = FALSE;
                    }
                    else {
                      $return = TRUE;
                    }
                    break;

                  case 'register':
                    if (isset($userInfo['register'])) {
                      $return = $userInfo['register'];
                    }

                    break;

                  case 'userinfo_mappings':
                    $return = ['mail' => 'mail'];
                    break;
                }
                return $return;
              });

            $this->configFactory->expects($this->any())
              ->method('get')
              ->willReturnCallback(function ($config) use ($immutableConfig) {
                if (
                  $config === 'openid_connect.settings' ||
                  $config === 'user.settings'
                ) {
                  return $immutableConfig;
                }

                return FALSE;
              });
          }
        }
      }
    }

    $oidcMock = $this->getMockBuilder('\Drupal\openid_connect\OpenIDConnect')
      ->setConstructorArgs([
        $this->configFactory,
        $this->authMap,
        $this->entityTypeManager,
        $this->entityFieldManager,
        $this->currentUser,
        $this->userData,
        $this->emailValidator,
        $this->messenger,
        $this->moduleHandler,
        $this->logger,
        $this->fileSystem,
      ])
      ->setMethods([
        'userPropertiesIgnore',
        'createUser',
      ])
      ->getMock();

    $oidcMock->method('userPropertiesIgnore')
      ->willReturn(['uid' => 'uid', 'name' => 'name']);

    $oidcMock->method('createUser')
      ->willReturn(
        $this->createMock(UserInterface::class)
      );

    $authorization = $oidcMock
      ->completeAuthorization($client, $tokens, $destination);

    if (empty($userData) && empty($userInfo)) {
      $this->assertEquals(FALSE, $authorization);
    }

    if (!empty($userInfo) && empty($userInfo['email'])) {
      $this->assertEquals(FALSE, $authorization);
    }
  }

  /**
   * Data provider for the testCompleteAuthorization() method.
   *
   * @return array|array[]
   *   Test parameters to pass to testCompleteAuthorization().
   */
  public function dataProviderForCompleteAuthorization(): array {
    $tokens = [
      "id_token" => $this->randomMachineName(),
      "access_token" => $this->randomMachineName(),
    ];

    return [
      [
        TRUE,
        '',
        [],
        [],
        [],
        FALSE,
        TRUE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [],
        FALSE,
        TRUE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => '',
        ],
        FALSE,
        TRUE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'test@test.com',
          'sub' => $this->randomMachineName(),
        ],
        FALSE,
        TRUE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'test@test.com',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        TRUE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'invalid',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'duplicate@valid.com',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'blocked' => TRUE,
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'blocked' => TRUE,
          'sub' => 'TESTING',
        ],
        TRUE,
        TRUE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'newAccount' => TRUE,
          'register' => 'admin_only',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'newAccount' => TRUE,
          'register' => 'visitors',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'newAccount' => TRUE,
          'register' => 'visitors_admin_approval',
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
      [
        FALSE,
        '',
        $tokens,
        [],
        [
          'email' => 'connect@valid.com',
          'newAccount' => TRUE,
          'register' => 'admin_only',
          'registerOverride' => TRUE,
          'sub' => $this->randomMachineName(),
        ],
        TRUE,
        FALSE,
      ],
    ];
  }

  /**
   * Test the connectCurrentUser method.
   *
   * @param bool $authenticated
   *   Whether the user is authenticated.
   * @param array $tokens
   *   The tokens to return.
   * @param array $userData
   *   The user data array.
   * @param array $userInfo
   *   The user infor array.
   * @param bool $expectedResult
   *   The expected result of the method.
   *
   * @dataProvider dataProviderForConnectCurrentUser
   */
  public function testConnectCurrentUser(
    bool $authenticated,
    array $tokens,
    array $userData,
    array $userInfo,
    bool $expectedResult
  ): void {
    $pluginId = $this->randomMachineName();

    $client = $this
      ->createMock(OpenIDConnectClientInterface::class);

    $client->expects($this->any())
      ->method('getPluginId')
      ->willReturn($pluginId);

    $this->currentUser->expects($this->once())
      ->method('isAuthenticated')
      ->willReturn($authenticated);

    if (!$authenticated) {
      $this->expectException('RuntimeException');
    }
    else {
      $client->expects($this->once())
        ->method('decodeIdToken')
        ->with($tokens['id_token'])
        ->willReturn($userData);

      $client->expects($this->once())
        ->method('retrieveUserInfo')
        ->with($tokens['access_token'])
        ->willReturn($userInfo);

      if (empty($userInfo) && empty($userData)) {
        $this->oidcLogger->expects($this->once())
          ->method('error')
          ->with(
            'No user information provided by @provider (@code @error). Details: @details',
            ['@provider' => $pluginId]
          );
      }

      if (isset($userInfo['email']) && empty($userInfo['email'])) {
        $this->oidcLogger->expects($this->once())
          ->method('error')
          ->with(
            'No e-mail address provided by @provider (@code @error). Details: @details',
            ['@provider' => $pluginId]
          );
      }

      if (isset($userData['sub']) && $userData['sub'] === 'invalid') {
        $account = $this
          ->createMock(UserInterface::class);

        $this->authMap->expects($this->once())
          ->method('userLoadBySub')
          ->willReturn($account);

        $this->moduleHandler->expects($this->once())
          ->method('invokeAll')
          ->with('openid_connect_pre_authorize')
          ->willReturn([FALSE]);
      }

      if (isset($userData['sub']) && $userData['sub'] === 'different_account') {
        $accountId = 8675309;
        $userId = 3456;

        $this->currentUser->expects($this->once())
          ->method('id')
          ->willReturn($userId);

        $account = $this
          ->createMock(UserInterface::class);

        $account->expects($this->once())
          ->method('id')
          ->willReturn($accountId);

        $this->authMap->expects($this->once())
          ->method('userLoadBySub')
          ->willReturn($account);

        $this->moduleHandler->expects($this->once())
          ->method('invokeAll')
          ->with('openid_connect_pre_authorize')
          ->willReturn([$account]);

        $this->messenger->expects($this->once())
          ->method('addError');
      }

      if (isset($userData['sub']) && $userData['sub'] === 'no_account') {
        $accountId = 8675309;

        $this->currentUser->expects($this->once())
          ->method('id')
          ->willReturn($accountId);

        $account = $this
          ->createMock(User::class);

        $this->userStorage->expects($this->once())
          ->method('load')
          ->with($accountId)
          ->willReturn($account);

        $this->authMap->expects($this->once())
          ->method('userLoadBySub')
          ->willReturn(FALSE);

        $mappings = [
          'mail' => 'mail',
          'name' => 'name',
        ];

        if ($userData['always_save'] === TRUE) {
          $fieldDefinitions = [];
          foreach ($userInfo as $key => $value) {
            $mappings[$key] = $key;

            switch ($key) {
              case 'email':
                $returnType = 'string';
                break;

              case 'field_string':
                $account->expects($this->once())
                  ->method('set');

                $returnType = 'string';
                break;

              case 'field_string_long':
                $account->expects($this->once())
                  ->method('set');
                $returnType = 'string_long';
                break;

              case 'field_datetime':
                $account->expects($this->once())
                  ->method('set');
                $returnType = 'datetime';
                break;

              case 'field_image':
                $this->fileSystem->expects($this->once())
                  ->method('basename')
                  ->with($value)
                  ->willReturn('test-file');
                $account->expects($this->once())
                  ->method('set');

                $returnType = 'image';

                $mockFile = $this->createMock(File::class);
                $mockFile->expects($this->once())
                  ->method('delete');

                $fieldItem = $this
                  ->createMock(FieldItemListInterface::class);
                $fieldItem->expects($this->once())
                  ->method('__get')
                  ->with('entity')
                  ->willReturn($mockFile);

                $account->expects($this->once())
                  ->method('__get')
                  ->willReturn($fieldItem);
                break;

              case 'field_invalid':
                $account->expects($this->never())
                  ->method('set');

                $this->oidcLogger->expects($this->once())
                  ->method('error')
                  ->with(
                    'Could not save user info, property type not implemented: %property_type',
                    ['%property_type' => $key]
                  );
                $returnType = $key;
                break;

              case 'field_image_exception':
                $exception = $this
                  ->createMock(InvalidArgumentException::class);

                $account->expects($this->once())
                  ->method('set')
                  ->willThrowException($exception);

                $returnType = 'string';
                break;

              default:
                $returnType = $key;
                break;
            }
            $mock = $this
              ->createMock(FieldDefinitionInterface::class);

            $mock->expects($this->any())
              ->method('getType')
              ->willReturn($returnType);

            $fieldDefinitions[$key] = $mock;

          }

          $this->entityFieldManager->expects($this->once())
            ->method('getFieldDefinitions')
            ->with('user', 'user')
            ->willReturn($fieldDefinitions);

          $this->moduleHandler->expects($this->exactly(3))
            ->method('invokeAll')
            ->withConsecutive(
              ['openid_connect_pre_authorize'],
              ['openid_connect_userinfo_save'],
              ['openid_connect_post_authorize']
            )
            ->willReturnOnConsecutiveCalls(
              [],
              TRUE,
              TRUE
            );

        }
        else {
          $this->moduleHandler->expects($this->exactly(2))
            ->method('invokeAll')
            ->withConsecutive(
              ['openid_connect_pre_authorize'],
              ['openid_connect_post_authorize']
            )
            ->willReturnOnConsecutiveCalls(
              [],
              TRUE
            );
        }

        $immutableConfig = $this
          ->createMock(ImmutableConfig::class);

        $immutableConfig->expects($this->atLeastOnce())
          ->method('get')
          ->withConsecutive(['always_save_userinfo'], ['userinfo_mappings'])
          ->willReturnOnConsecutiveCalls(
            $userData['always_save'],
            $mappings
          );

        $this->configFactory->expects($this->atLeastOnce())
          ->method('get')
          ->with('openid_connect.settings')
          ->willReturn($immutableConfig);
      }
    }

    $result = $this->openIdConnect->connectCurrentUser($client, $tokens);

    $this->assertEquals($expectedResult, $result);
  }

  /**
   * Data provider for the testConnectCurrentUser method.
   *
   * @return array|array[]
   *   Array of parameters to pass to testConnectCurrentUser().
   */
  public function dataProviderForConnectCurrentUser(): array {
    return [
      [
        FALSE,
        [],
        [],
        [],
        FALSE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [],
        [],
        FALSE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [],
        [
          'email' => FALSE,
        ],
        FALSE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'invalid',
        ],
        [
          'email' => 'valid@email.com',
        ],
        FALSE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'different_account',
        ],
        [
          'email' => 'valid@email.com',
        ],
        FALSE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => FALSE,
        ],
        [
          'email' => 'valid@email.com',
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'email' => 'valid@email.com',
          'name' => $this->randomMachineName(),
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'name' => $this->randomMachineName(),
          'field_string' => 'This is a string',
          'email' => 'valid@email.com',
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'field_string_long' => 'This is long text.',
          'email' => 'valid@email.com',
          'name' => $this->randomMachineName(),
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'field_datetime' => '2020-05-20',
          'email' => 'valid@email.com',
          'name' => $this->randomMachineName(),
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'name' => $this->randomMachineName(),
          'field_image' => realpath(__DIR__) . '/image.png',
          'email' => 'valid@email.com',
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'name' => $this->randomMachineName(),
          'field_invalid' => 'does_not_exist',
          'email' => 'valid@email.com',
        ],
        TRUE,
      ],
      [
        TRUE,
        [
          'id_token' => $this->randomMachineName(),
          'access_token' => $this->randomMachineName(),
        ],
        [
          'sub' => 'no_account',
          'always_save' => TRUE,
        ],
        [
          'name' => $this->randomMachineName(),
          'field_image_exception' => new \stdClass(),
          'email' => 'valid@email.com',
        ],
        TRUE,
      ],
    ];
  }

}
