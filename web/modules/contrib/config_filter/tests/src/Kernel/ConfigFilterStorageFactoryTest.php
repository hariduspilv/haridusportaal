<?php

namespace Drupal\Tests\config_filter\Kernel;

use Drupal\Core\Config\DatabaseStorage;
use Drupal\KernelTests\KernelTestBase;

/**
 * Class ConfigFilterStorageFactoryTest.
 *
 * @group config_filter
 */
class ConfigFilterStorageFactoryTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'config_filter',
    'config_filter_test',
    'config_filter_split_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->installConfig(['system']);
  }

  /**
   * Test that the config.storage.sync is decorated with the filtering version.
   */
  public function testServiceProvider() {
    // Export the configuration.
    $this->copyConfig($this->container->get('config.storage'), $this->container->get('config.storage.sync'));

    // The pirate filter changes the system.site when importing.
    $this->assertEquals(['system.site'], $this->configImporter()->getStorageComparer()->getChangelist('update'));
    $this->assertEmpty($this->configImporter()->getStorageComparer()->getChangelist('create'));
    $this->assertEmpty($this->configImporter()->getStorageComparer()->getChangelist('delete'));
    $this->assertEmpty($this->configImporter()->getStorageComparer()->getChangelist('rename'));

    $config = $this->config('system.site')->getRawData();
    $config['name'] .= ' Arrr';

    $this->assertEquals($config, $this->container->get('config.storage.sync')->read('system.site'));
  }

  /**
   * Test the storage factory decorating properly.
   */
  public function testStorageFactory() {
    /** @var \Drupal\Core\Database\Connection $database */
    $database = $this->container->get('database');
    $destination = new DatabaseStorage($database, 'config_filter_source_test');

    // The $filtered storage will have the simple split applied to the
    // destination storage, but is the unified storage.
    $filtered = $this->container->get('config_filter.storage_factory')->getFilteredStorage($destination, ['test_storage']);

    /** @var \Drupal\Core\Config\StorageInterface $active */
    $active = $this->container->get('config.storage');

    // Export the configuration to the filtered storage.
    $this->copyConfig($active, $filtered);

    // Get the storage of the test split plugin.
    $splitStorage = new DatabaseStorage($database, 'config_filter_split_test');

    // Assert that the storage is properly split.
    $this->assertTrue(count($destination->listAll()) > 0);
    $this->assertTrue(count($splitStorage->listAll()) > 0);
    $this->assertEquals(count($active->listAll()), count($destination->listAll()) + count($splitStorage->listAll()));
    $this->assertEquals($active->listAll('core'), $splitStorage->listAll());
    $this->assertEquals($active->listAll('system'), $destination->listAll('system'));

    $this->assertEquals($active->readMultiple($active->listAll('core')), $splitStorage->readMultiple($splitStorage->listAll()));
    $this->assertEquals($active->readMultiple($active->listAll('system')), $destination->readMultiple($destination->listAll('system')));

    // Reading from the $filtered storage returns the merged config.
    $this->assertEquals($active->listAll(), $filtered->listAll());
    $this->assertEquals($active->readMultiple($active->listAll()), $filtered->readMultiple($filtered->listAll()));
  }

}
