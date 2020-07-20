<?php

namespace Drupal\config_sync;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;
use Symfony\Component\DependencyInjection\Exception\ServiceNotFoundException;

class ConfigSyncServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    // This service was introduced as a new dependency in config_sync
    // 8.x-2.0-beta2.
    // @see https://www.drupal.org/project/drupal/issues/2863986
    try {
      $container->getDefinition('plugin.manager.config_normalizer');
    }
    // If the service is not available, remove its dependent services. A
    // Symfony\Component\DependencyInjection\Exception\ServiceNotFoundException
    // would prevent installing the new module dependency.
    catch (ServiceNotFoundException $exception) {
      // Requires 'plugin.manager.config_normalizer'.
      $container->removeDefinition('config_sync.lister');
      // Both require 'config_sync.lister'.
      $container->removeDefinition('config_sync.snapshotter');
      $container->removeDefinition('config_sync.commands');
      // Requires config_sync.snapshotter.
      $container->removeDefinition('config_sync_snapshot_subscriber');
    }
  }

}
