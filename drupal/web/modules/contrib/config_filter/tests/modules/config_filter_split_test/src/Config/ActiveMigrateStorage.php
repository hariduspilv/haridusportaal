<?php

namespace Drupal\config_filter_migrate_test\Config;

use Drupal\config_filter\Config\FilteredStorage;
use Drupal\config_filter_split_test\Plugin\ConfigFilter\TestSplitFilter;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Config\CachedStorage;
use Drupal\Core\Config\FileStorage;
use Drupal\Core\Config\StorageInterface;

/**
 * Class ActiveMigrateStorage.
 */
class ActiveMigrateStorage extends CachedStorage {

  /**
   * Create an ActiveMigrateStorage.
   *
   * @param \Drupal\Core\Config\StorageInterface $storage
   *   The decorated storage.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache
   *   A cache backend used to store configuration.
   * @param string $migrate_folder
   *   The migrate directory.
   */
  public function __construct(StorageInterface $storage, CacheBackendInterface $cache, $migrate_folder) {
    // Create the filter directly, the plugin manager is not yet available.
    $filter = new TestSplitFilter(new FileStorage($migrate_folder), 'migrate_plus.migration');
    // Wrap the storage with the the filtered storage.
    parent::__construct(new FilteredStorage($storage, [$filter]), $cache);
  }

}
