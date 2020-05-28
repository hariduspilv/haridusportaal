<?php

namespace Drupal\Tests\jwt\Kernel;

use Drupal\jwt\JsonWebToken\JsonWebToken;
use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Symfony\Component\HttpFoundation\Request;

/**
 * Tests JWT config schema.
 *
 * @group JWT
 */
class UserPathAuthTest extends KernelTestBase {
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
    'jwt_path_auth',
    'jwt_test',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->installSchema('system', 'sequences');

    $this->installEntitySchema('user');

    $this->installConfig(['field', 'key', 'jwt', 'jwt_path_auth', 'jwt_test']);
  }

  /**
   * Verify the authentication for a user.
   */
  public function testAuth() {
    $account = $this->createUser(['access content']);
    $this->setCurrentUser($account);
    /** @var \Drupal\jwt_path_auth\Authentication\Provider\JwtPathAuth $auth_service */
    $auth_service = $this->container->get('jwt_path_auth.authentication.jwt');
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'path_auth', 'uid'], $account->id());
    $jwt->setClaim(['drupal', 'path_auth', 'path'], '/');
    $token = $transcoder->encode($jwt);
    $request = Request::create('/system/files/private/drupal.txt', 'GET', ['jwt' => $token]);
    $this->assertTrue($auth_service->applies($request));
    $this->assertNotEmpty($auth_service->authenticate($request));
    $request = Request::create('/node/1', 'GET', ['jwt' => $token]);
    $this->assertFalse($auth_service->applies($request));
    $config = $this->config('jwt_path_auth.config');
    $config->set('allowed_path_prefixes', ['/node/']);
    $config->save();
    $request = Request::create('/system/files/private/drupal.txt', 'GET', ['jwt' => $token]);
    $this->assertFalse($auth_service->applies($request));
    $request = Request::create('/node/1', 'GET', ['jwt' => $token]);
    $this->assertTrue($auth_service->applies($request));
    $this->assertNotEmpty($auth_service->authenticate($request));
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'path_auth', 'uid'], $account->id());
    $jwt->setClaim(['drupal', 'path_auth', 'path'], '/foo');
    $token = $transcoder->encode($jwt);
    $request = Request::create('/node/1', 'GET', ['jwt' => $token]);
    $this->assertTrue($auth_service->applies($request));
    // The claim path does not match the request path.
    $this->assertNull($auth_service->authenticate($request));
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'path_auth', 'uid'], $account->id() + 1);
    $jwt->setClaim(['drupal', 'path_auth', 'path'], '/');
    $request = Request::create('/node/1', 'GET', ['jwt' => $token]);
    $this->assertTrue($auth_service->applies($request));
    // The uid does not match a valid uid.
    $this->assertNull($auth_service->authenticate($request));
    // Block account should not be authenticated.
    $account->block()->save();
    $request = Request::create('/node/1', 'GET', ['jwt' => $token]);
    $this->assertTrue($auth_service->applies($request));
    $this->assertNull($auth_service->authenticate($request));
  }

}
