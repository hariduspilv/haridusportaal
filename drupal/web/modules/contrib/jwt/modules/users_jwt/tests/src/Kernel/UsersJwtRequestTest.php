<?php

namespace Drupal\Tests\users_jwt\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Firebase\JWT\JWT;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests JWT config schema.
 *
 * @group JWT
 */
class UsersJwtRequestTest extends KernelTestBase {
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'user',
    'users_jwt',
  ];

  /**
   * The test user.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $testUser;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->installSchema('system', 'sequences');

    $this->installEntitySchema('user');
    $this->installSchema('user', ['users_data']);

    $this->installConfig(['users_jwt']);
    $account = $this->createUser(['access content']);
    $this->setCurrentUser($account);
    $this->testUser = $account;
  }

  /**
   * Verify the authentication for a user.
   */
  public function testAuth() {
    /** @var \Drupal\users_jwt\UsersJwtKeyRepositoryInterface $key_repository */
    $key_repository = $this->container->get('users_jwt.key_repository');
    $path = drupal_get_path('module', 'users_jwt') . '/tests/fixtures/users_jwt_rsa1-public.pem';
    $public_key = file_get_contents($path);
    $key_repository->saveKey($this->testUser->id(), 'wxyz', 'RS256', $public_key);
    $iat = \Drupal::time()->getRequestTime();
    $good_payload = [
      'iat' => $iat,
      'exp' => $iat + 1000,
      'drupal' => [
        'uid' => $this->testUser->id(),
      ],
    ];
    $path = drupal_get_path('module', 'users_jwt') . '/tests/fixtures/users_jwt_rsa1-private.pem';
    $private_key = file_get_contents($path);
    /** @var \Drupal\Core\Authentication\AuthenticationProviderInterface $auth_service */
    $auth_service = $this->container->get('users_jwt.authentication.jwt');
    $other_account = $this->createUser(['access content']);

    foreach (['Authorization', 'JWT-Authorization'] as $header) {
      $token = JWT::encode($good_payload, $private_key, 'RS256', 'wxyz');
      $this->assertNotEmpty($token);
      // Bearer token is ignored.
      $request = Request::create('/');
      $request->headers->set($header, 'Bearer ' . $token);
      $this->assertFalse($auth_service->applies($request));
      $request = Request::create('/');
      // Empty token is ignored.
      $this->assertFalse($auth_service->applies($this->createRequest($header, '')));
      // Good token applies.
      $request = $this->createRequest($header, $token);
      $this->assertTrue($auth_service->applies($request));
      $user = $auth_service->authenticate($request);
      $this->assertNotEmpty($user);
      $this->assertEqual($this->testUser->id(), $user->id());
      // When blocked the account is no longer valid.
      $this->testUser->block()->save();
      $this->assertNull($auth_service->authenticate($request));
      $this->testUser->activate()->save();
      // Payload with more claims is accepted.
      $extra_payload = $good_payload + ['iss' => 'test', 'hello' => 'world'];
      $token = JWT::encode($extra_payload, $private_key, 'RS256', 'wxyz');
      $this->assertNotEmpty($auth_service->authenticate($this->createRequest($header, $token)));
      // JWT with a non-existent key ID is rejected.
      $token = JWT::encode($good_payload, $private_key, 'RS256', 'foo');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
      // JWT with no key ID is rejected.
      $token = JWT::encode($good_payload, $private_key, 'RS256');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
      // User ID that does not match the key's user ID is rejected.
      $payload = $good_payload;
      $payload['drupal']['uid'] = $other_account->id();
      $token = JWT::encode($payload, $private_key, 'RS256', 'wxyz');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
      // Payload missing iat is rejected.
      $payload = $good_payload;
      unset($payload['iat']);
      $token = JWT::encode($payload, $private_key, 'RS256', 'wxyz');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
      // Payload missing exp is rejected.
      $payload = $good_payload;
      unset($payload['exp']);
      $token = JWT::encode($payload, $private_key, 'RS256', 'wxyz');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
      // Payload with too large iat to exp is rejected.
      $payload = $good_payload;
      $payload['exp'] += 24 * 3600;
      $token = JWT::encode($payload, $private_key, 'RS256', 'wxyz');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
      // JWT with HMAC algorithm is rejected.
      $token = JWT::encode($good_payload, $private_key, 'HS256', 'wxyz');
      $this->assertNull($auth_service->authenticate($this->createRequest($header, $token)));
    }
  }

  /**
   * Create a request with UsersJwt authorization header.
   *
   * @param string $header_name
   *   Header name.
   * @param string $token
   *   The JWT token string.
   *
   * @return \Symfony\Component\HttpFoundation\Request
   *   The new request.
   */
  protected function createRequest($header_name, $token): Request {
    $request = Request::create('/');
    $request->headers->set($header_name, 'UsersJwt ' . $token);
    return $request;
  }

}
