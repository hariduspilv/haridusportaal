<?php

namespace Drupal\Tests\jwt\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\Tests\user\Traits\UserCreationTrait;
use Firebase\JWT\JWT;
use Firebase\JWT\SignatureInvalidException;

/**
 * Tests RSA keys.
 *
 * @group JWT
 */
class RsaKeyTest extends KernelTestBase {
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = ['system', 'user', 'field', 'key', 'jwt', 'jwt_auth_issuer', 'jwt_auth_consumer', 'jwt_test'];

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
   * Verify generation and verification with RSA.
   */
  public function testRsaGenerateToken() {
    $config = $this->config('jwt.config');
    $config->set('algorithm', 'RS256');
    $config->set('key_id', 'jwt_test_rsa');
    $config->save();
    $account = $this->createUser(['access content']);
    $this->setCurrentUser($account);
    $auth = $this->container->get('jwt.authentication.jwt');
    $token = $auth->generateToken();
    $this->assertNotEmpty($token);
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $decoded_jwt = $transcoder->decode($token);
    $this->assertEqual($account->id(), $decoded_jwt->getClaim(['drupal', 'uid']));
    // Test decoding with the matched and mis-matched public keys.
    $path = drupal_get_path('module', 'jwt_test') . '/fixtures/jwt_test_rsa-public.pem';
    $public_key = file_get_contents($path);
    $payload = JWT::decode($token, $public_key, ['RS256']);
    $this->assertEqual($account->id(), $payload->drupal->uid);
    $path = drupal_get_path('module', 'jwt_test') . '/fixtures/jwt_test_rsa2-public.pem';
    $public_key = file_get_contents($path);
    $this->expectException(SignatureInvalidException::class);
    $payload = JWT::decode($token, $public_key, ['RS256']);
  }

  /**
   * Verification with RSA public key only.
   */
  public function testRsaPublicDecodeToken() {
    $config = $this->config('jwt.config');
    $config->set('algorithm', 'RS256');
    $config->set('key_id', 'jwt_test_rsa2');
    $config->save();
    $path = drupal_get_path('module', 'jwt_test') . '/fixtures/jwt_test_rsa2-private.pem';
    $private_key = file_get_contents($path);
    $exp = \Drupal::time()->getRequestTime() + 1000;
    $payload = [
      'exp' => $exp,
      'test' => [
        'uid' => 999,
      ],
    ];
    $token = JWT::encode($payload, $private_key ,'RS256', 'wxyz');
    $this->assertNotEmpty($token);
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $decoded_jwt = $transcoder->decode($token);
    $this->assertEqual(999, $decoded_jwt->getClaim(['test', 'uid']));
    $this->assertEqual($exp, $decoded_jwt->getClaim('exp'));
  }

}
