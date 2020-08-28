<?php

declare(strict_types = 1);

namespace Drupal\Tests\openid_connect\Unit;

use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Config\ImmutableConfig;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\Extension\ModuleHandler;
use Drupal\openid_connect\OpenIDConnectClaims;
use Drupal\Tests\UnitTestCase;

/**
 * Test the OpenIdConnectClaims class.
 *
 * @coversDefaultClass \Drupal\openid_connect\OpenIDConnectClaims
 * @group openid_connect
 */
class OpenIdConnectClaimsTest extends UnitTestCase {

  /**
   * The default count of the available claims.
   */
  const DEFAULT_CLAIMS_COUNT = 19;

  /**
   * The default userinfo_mappings array.
   */
  const USERINFO_MAPPINGS = [
    'timezone' => 'zoneinfo',
    'user_picture' => 'picture',
  ];

  /**
   * A mock of the config.factory service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $configFactory;

  /**
   * A mock of the module_handler service.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject
   */
  protected $moduleHandler;

  /**
   * The OpenIdConnectClaims class being tested.
   *
   * @var \Drupal\openid_connect\OpenIDConnectClaims
   */
  protected $openIdConnectClaims;

  /**
   * Mock of the container for service calls.
   *
   * @var \Drupal\Core\DependencyInjection\ContainerBuilder
   */
  protected $container;

  /**
   * {@inheritDoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->configFactory = $this->createMock(ConfigFactory::class);
    $this->moduleHandler = $this->createMock(ModuleHandler::class);

    $this->container = new ContainerBuilder();

    $this->container->set('module_handler', $this->moduleHandler);
    $this->container->set('config.factory', $this->configFactory);
    $this->container->set('string_translation', self::getStringTranslationStub());

    \Drupal::setContainer($this->container);

    $this->openIdConnectClaims = OpenIDConnectClaims::create($this->container);
  }

  /**
   * Test the getClaims method and ensure the alter method is invoked.
   */
  public function testGetClaimsAlter(): void {
    $this->moduleHandler
      ->expects($this->atLeast(1))
      ->method('alter')
      ->with('openid_connect_claims');

    $this->openIdConnectClaims->getClaims();
  }

  /**
   * Test the default claims array.
   *
   * @param string $key
   *   The key for the claim.
   * @param string $scope
   *   The scope for the claim.
   * @param string $type
   *   The data type for the claim.
   *
   * @dataProvider defaultClaimsProvider
   *   The data profiled for the claims test.
   */
  public function testGetDefaultClaims($key, $scope, $type): void {
    $claims = $this->openIdConnectClaims->getClaims();

    // Ensure the default key exists.
    $this->assertArrayHasKey($key, $claims);

    // Assert the scope is correct.
    $this->assertEquals($scope, $claims[$key]['scope']);

    // Assert the type is correct.
    $this->assertEquals($type, $claims[$key]['type']);
  }

  /**
   * Test the default count of the default claims.
   */
  public function testDefaultClaimsCount(): void {
    $claims = $this->openIdConnectClaims->getClaims();
    $this->assertCount(self::DEFAULT_CLAIMS_COUNT, $claims);
  }

  /**
   * Test the options array for the form api.
   *
   * @param string $key
   *   The key for the claim.
   * @param string $scope
   *   The scope for the claim.
   * @param string $type
   *   The data type for the claim.
   *
   * @dataProvider defaultClaimsProvider
   *   The data profiled for the claims test.
   */
  public function testGetOptions($key, $scope, $type): void {
    // Get the options.
    $options = $this->openIdConnectClaims->getOptions();

    $this->assertArrayHasKey(ucfirst($scope), $options);

    $this->assertArrayHasKey($key, $options[ucfirst($scope)]);
  }

  /**
   * Test the default getScopes() method.
   */
  public function testDefaultGetScopes(): void {
    $userInfoMapping = $this->createMock(ImmutableConfig::class);
    $userInfoMapping->expects($this->once())
      ->method('get')
      ->willReturn(self::USERINFO_MAPPINGS);

    $this->configFactory
      ->expects($this->once())
      ->method('getEditable')
      ->willReturn($userInfoMapping);

    $scopes = $this->openIdConnectClaims->getScopes();

    $this->assertEquals('openid email profile', $scopes);
  }

  /**
   * Test the scopes based on the user mappings.
   *
   * @param string $key
   *   The key for the claim.
   * @param string $scope
   *   The scope for the claim.
   * @param string $type
   *   The data type for the claim.
   *
   * @dataProvider defaultClaimsProvider
   *   The data profiled for the claims test.
   */
  public function testUserInfoMappingScopes($key, $scope, $type): void {

    $mappings = self::USERINFO_MAPPINGS;

    // Append the provided key to the mappings.
    $mappings[$key] = $this->randomMachineName();

    $userInfoMapping = $this->createMock(ImmutableConfig::class);
    $userInfoMapping->expects($this->once())
      ->method('get')
      ->willReturn($mappings);

    $this->configFactory
      ->expects($this->once())
      ->method('getEditable')
      ->willReturn($userInfoMapping);

    $actualScopes = $this->openIdConnectClaims->getScopes();

    switch ($scope) {
      case 'email':
      case 'address':
      case 'phone':
        $this->assertEquals("openid email profile", $actualScopes);
        break;

      default:
        $this->assertEquals("openid email {$scope}", $actualScopes);
        break;

    }

  }

  /**
   * Get the expected default claims.
   *
   * @return array
   *   The default key, scope, type for the claims.
   */
  public function defaultClaimsProvider(): array {
    return [
      ['name', 'profile', 'string'],
      ['given_name', 'profile', 'string'],
      ['family_name', 'profile', 'string'],
      ['middle_name', 'profile', 'string'],
      ['nickname', 'profile', 'string'],
      ['preferred_username', 'profile', 'string'],
      ['profile', 'profile', 'string'],
      ['picture', 'profile', 'string'],
      ['website', 'profile', 'string'],
      ['email', 'email', 'string'],
      ['email_verified', 'email', 'boolean'],
      ['gender', 'profile', 'string'],
      ['birthdate', 'profile', 'string'],
      ['zoneinfo', 'profile', 'string'],
      ['locale', 'profile', 'string'],
      ['phone_number', 'phone', 'string'],
      ['phone_number_verified', 'phone', 'boolean'],
      ['address', 'address', 'json'],
      ['updated_at', 'profile', 'number'],
    ];
  }

}
