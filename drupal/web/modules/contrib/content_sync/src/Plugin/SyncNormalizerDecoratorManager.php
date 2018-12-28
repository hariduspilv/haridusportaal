<?php

namespace Drupal\content_sync\Plugin;

use Drupal\Core\Plugin\DefaultPluginManager;
use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;

/**
 * Provides the Sync normalizer decorator plugin manager.
 */
class SyncNormalizerDecoratorManager extends DefaultPluginManager {

  /**
   * Constructor for SyncNormalizerDecoratorManager objects.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler to invoke the alter hook with.
   */
  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler) {
    parent::__construct('Plugin/SyncNormalizerDecorator', $namespaces, $module_handler, 'Drupal\content_sync\Plugin\SyncNormalizerDecoratorInterface', 'Drupal\content_sync\Annotation\SyncNormalizerDecorator');

    $this->alterInfo('content_sync_sync_normalizer_decorator_info');
    $this->setCacheBackend($cache_backend, 'content_sync_sync_normalizer_decorator_plugins');
  }

}
