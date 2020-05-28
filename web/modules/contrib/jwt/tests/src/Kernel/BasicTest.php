<?php

namespace Drupal\Tests\jwt\Kernel;

use Drupal\jwt\JsonWebToken\JsonWebToken;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests JWT config schema.
 *
 * @group JWT
 */
class BasicTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['system', 'key', 'jwt', 'jwt_test'];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->installConfig(['key', 'jwt', 'jwt_test']);
  }

  /**
   * Verify the test config was loaded as keys.
   */
  public function testConfig() {
    /** @var \Drupal\key\KeyRepositoryInterface $key_repository */
    $key_repository = $this->container->get('key.repository');
    $key_hmac = $key_repository->getKey('jwt_test_hmac');
    $this->assertNotEmpty($key_hmac);
    $this->assertEqual('jwt_hs', $key_hmac->getKeyType()->getPluginId());
    $key_rsa = $key_repository->getKey('jwt_test_rsa');
    $this->assertNotEmpty($key_rsa);
    $this->assertEqual('jwt_rs', $key_rsa->getKeyType()->getPluginId());
    // The jwt_test module configures the jwt_test_hmac key to be used.
    /** @var \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder */
    $transcoder = $this->container->get('jwt.transcoder');
    $reflected = new \ReflectionClass($transcoder);
    $algorithm = $reflected->getProperty('algorithm');
    $algorithm->setAccessible(TRUE);
    $this->assertEqual('HS256', $algorithm->getValue($transcoder));
    $jwt = new JsonWebToken();
    $jwt->setClaim(['drupal', 'test'], 1234);
    $encoded = $transcoder->encode($jwt);
    $this->assertNotEmpty($encoded);
    $this->assertTrue(is_string($encoded));
    $decoded_jwt = $transcoder->decode($encoded);
    $this->assertEqual(1234, $decoded_jwt->getClaim(['drupal', 'test']));
  }

}
