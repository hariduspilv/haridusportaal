<?php

namespace Drupal\purge\Tests\Purger;

use Drupal\Component\Plugin\Discovery\CachedDiscoveryInterface;
use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\purge\Tests\KernelServiceTestBase;

/**
 * Tests \Drupal\purge\Plugin\Purge\Purger\PluginManager.
 *
 * @group purge
 * @see \Drupal\Core\Plugin\DefaultPluginManager
 */
class PluginManagerTest extends KernelServiceTestBase {

  /**
   * The name of the service as defined in services.yml.
   *
   * @var string
   */
  protected $serviceId = 'plugin.manager.purge.purgers';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_purger_test'];

  /**
   * All metadata from \Drupal\purge\Annotation\PurgePurger.
   *
   * @var string[]
   */
  protected $annotationFields = [
    'class',
    'provider',
    'id',
    'label',
    'configform',
    'cooldown_time',
    'description',
    'multi_instance',
    'types',
  ];

  /**
   * All bundled plugins in purge core, including in the test module.
   *
   * @var string[]
   */
  protected $plugins = [
    'a',
    'b',
    'c',
    'good',
    'withform',
  ];

  /**
   * Test if the plugin manager is built as we'd like.
   */
  public function testCodeContract() {
    $this->assertTrue($this->service instanceof PluginManagerInterface);
    $this->assertTrue($this->service instanceof DefaultPluginManager);
    $this->assertTrue($this->service instanceof CachedDiscoveryInterface);
  }

  /**
   * Test the plugins we expect to be available.
   */
  public function testDefinitions() {
    $definitions = $this->service->getDefinitions();
    foreach ($this->plugins as $plugin_id) {
      $this->assertTrue(isset($definitions[$plugin_id]));
    }
    foreach ($definitions as $plugin_id => $md) {
      $this->assertTrue(in_array($plugin_id, $this->plugins));
    }
    foreach ($definitions as $plugin_id => $md) {
      foreach ($md as $field => $value) {
        $this->assertTrue(in_array($field, $this->annotationFields));
      }
      foreach ($this->annotationFields as $field) {
        $this->assertTrue(isset($md[$field]));
      }
    }
  }

}
