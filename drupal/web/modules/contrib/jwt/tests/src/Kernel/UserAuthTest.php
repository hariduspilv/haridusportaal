<?php

namespace Drupal\Tests\jwt\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Tests JWT config schema.
 *
 * @group JWT
 */
class UserAuthTest extends KernelTestBase {
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'user',
    'field',
    'key',
    'jwt',
    'jwt_auth_issuer',
    'jwt_auth_consumer',
    'jwt_test',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->installSchema('system', 'sequences');

    $this->installEntitySchema('user');

    $this->installConfig(['field', 'key', 'jwt', 'jwt_test']);
  }

  /**
   * Verify the authentication for a user.
   */
  public function testAuth() {
    $account = $this->createUser(['access content']);
    $this->setCurrentUser($account);
    /** @var \Drupal\jwt\Authentication\Provider\JwtAuth $auth */
    $auth = $this->container->get('jwt.authentication.jwt');
    $token = $auth->generateToken();
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $decoded_jwt = $transcoder->decode($token);
    $this->assertEqual($account->id(), $decoded_jwt->getClaim(['drupal', 'uid']));
    /** @var \Drupal\Core\Authentication\AuthenticationProviderInterface $auth_service */
    $auth_service = $this->container->get('jwt.authentication.jwt');
    foreach (['Authorization', 'JWT-Authorization'] as $header) {
      $request = Request::create('/');
      $request->headers->set($header, 'Bearer ' . $token);
      $this->assertTrue($auth_service->applies($request));
      $user = $auth_service->authenticate($request);
      $this->assertEqual($account->id(), $user->id());
      // When blocked the account is no longer valid.
      $account->block()->save();
      try {
        $auth_service->authenticate($request);
        $this->fail('Exception not thrown');
      }
      catch (AccessDeniedHttpException $e) {
        $this->assertEqual('User is blocked.', $e->getMessage());
      }
      $account->activate()->save();
    }
  }

}
