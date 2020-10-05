<?php

namespace Drupal\openid_connect\Plugin;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;
use Traversable;

/**
 * Provides the OpenID Connect client plugin manager.
 */
class OpenIDConnectClientManager extends DefaultPluginManager {

  /**
   * Constructor for OpenIDConnectClientManager objects.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler to invoke the alter hook with.
   */
  public function __construct(
      Traversable $namespaces,
      CacheBackendInterface $cache_backend,
      ModuleHandlerInterface $module_handler
  ) {
    parent::__construct(
      'Plugin/OpenIDConnectClient',
      $namespaces,
      $module_handler,
      'Drupal\openid_connect\Plugin\OpenIDConnectClientInterface',
      'Drupal\openid_connect\Annotation\OpenIDConnectClient'
    );

    $this->alterInfo('openid_connect_client_info');
    $this->setCacheBackend(
      $cache_backend,
      'openid_connect_client_plugins'
    );
  }

}
