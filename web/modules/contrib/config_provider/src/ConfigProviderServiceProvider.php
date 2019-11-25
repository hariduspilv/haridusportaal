<?php

namespace Drupal\config_provider;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceProviderBase;

/**
 * Service provider implementation for Configuration Provider.
 *
 * @ingroup container
 */
class ConfigProviderServiceProvider extends ServiceProviderBase {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    // Override the config.installer class with a new class.
    $definition = $container->getDefinition('config.installer');
    $definition->setClass('Drupal\config_provider\ConfigProviderConfigInstaller');
  }

}
