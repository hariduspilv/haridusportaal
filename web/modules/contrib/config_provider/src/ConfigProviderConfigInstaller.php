<?php

namespace Drupal\config_provider;

use Drupal\Core\Config\ConfigInstaller;
use Drupal\Core\Config\ConfigInstallerInterface;
use Drupal\Core\Config\StorageInterface;

class ConfigProviderConfigInstaller extends ConfigInstaller implements ConfigInstallerInterface {

  /**
   * Overrides \Drupal\Core\Config\ConfigInstaller::getConfigToCreate().
   *
   * When extensions are installed, consult all registered config providers.
   *
   * @param StorageInterface $storage
   *   The configuration storage to read configuration from.
   * @param string $collection
   *  The configuration collection to use.
   * @param string $prefix
   *   (optional) Limit to configuration starting with the provided string.
   * @param \Drupal\Core\Config\StorageInterface[] $profile_storages
   *   An array of storage interfaces containing profile configuration to check
   *   for overrides.
   *
   * @return array
   *   An array of configuration data read from the source storage keyed by the
   *   configuration object name.
   */
  protected function getConfigToCreate(StorageInterface $storage, $collection, $prefix = '', array $profile_storages = []) {
    // Determine if we have configuration to create.
    $config_to_create = parent::getConfigToCreate($storage, $collection, $prefix, $profile_storages);

    /* @var \Drupal\config_provider\Plugin\ConfigCollectorInterface $config_collector */
    $config_collector = \Drupal::service('config_provider.collector');
    foreach ($config_collector->getConfigProviders() as $config_provider) {
      $config_provider->addConfigToCreate($config_to_create, $storage, $collection, $prefix, $profile_storages);
    }

    return $config_to_create;
  }

}
