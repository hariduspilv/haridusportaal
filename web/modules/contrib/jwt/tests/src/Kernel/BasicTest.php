<?php

namespace Drupal\Tests\jwt\Kernel;

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
    $key_repository = $this->container->get('key.repository');
    $key_hmac = $key_repository->getKey('jwt_test_hmac');
    $this->assertNotEmpty($key_hmac);
    $key_rsa = $key_repository->getKey('jwt_test_rsa');
    $this->assertNotEmpty($key_rsa);
  }

}
