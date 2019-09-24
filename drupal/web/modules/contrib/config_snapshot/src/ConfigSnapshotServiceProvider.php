<?php

namespace Drupal\config_snapshot;

use Drupal\Core\Config\BootstrapConfigStorageFactory;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

/**
 * Registers one service per config snapshot.
 */
class ConfigSnapshotServiceProvider extends ServiceProviderBase {

  const CONFIG_PREFIX = 'config_snapshot.snapshot.';

  /**
   * {@inheritdoc}
   */
  public function register(ContainerBuilder $container) {
    // @see Drupal\language\LanguageServiceProvider::isMultilingual()

    // @todo Try to swap out for config.storage to take advantage of database
    //   and caching. This might prove difficult as this is called before the
    //   container has finished building.
    $config_storage = BootstrapConfigStorageFactory::get();
    $config_ids = $config_storage->listAll(static::CONFIG_PREFIX);

    foreach ($config_ids as $config_id) {
      $snapshot = $config_storage->read($config_id);
      $container->register("config_snapshot.{$snapshot['snapshotSet']}.{$snapshot['extensionType']}.{$snapshot['extensionName']}", 'Drupal\config_snapshot\ConfigSnapshotStorage')
        ->addArgument($snapshot['snapshotSet'])
        ->addArgument($snapshot['extensionType'])
        ->addArgument($snapshot['extensionName']);
    }
  }

}
