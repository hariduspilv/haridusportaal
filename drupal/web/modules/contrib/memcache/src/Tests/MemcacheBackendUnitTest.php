<?php
namespace Drupal\memcache\Tests;

use Drupal\KernelTests\Core\Cache\GenericCacheBackendUnitTestBase;
use Drupal\memcache\MemcacheBackendFactory;

/**
 * Tests the MemcacheBackend.
 *
 * @group memcache
 */
class MemcacheBackendUnitTest extends GenericCacheBackendUnitTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['system', 'memcache'];

  /**
   * Creates a new instance of DatabaseBackend.
   *
   * @return \Drupal\memcache\MemcacheBackend
   *   A new MemcacheBackend object.
   */
  protected function createCacheBackend($bin) {
    $factory = new MemcacheBackendFactory($this->container->get('lock'), $this->container->get('memcache.config'), $this->container->get('memcache.factory'), $this->container->get('cache_tags.invalidator.checksum'));
    return $factory->get($bin);
  }

}
