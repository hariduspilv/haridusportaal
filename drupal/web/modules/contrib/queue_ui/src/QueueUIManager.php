<?php

namespace Drupal\queue_ui;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\DefaultPluginManager;

/**
 * Defines the queue worker manager.
 *
 * @see \Drupal\Core\Queue\QueueWorkerInterface
 * @see \Drupal\Core\Queue\QueueWorkerBase
 * @see \Drupal\Core\Annotation\QueueWorker
 * @see plugin_api
 */
class QueueUIManager extends DefaultPluginManager {

  /**
   * Constructs an QueueWorkerManager object.
   *
   * @param \Traversable $namespaces
   *   An object that implements \Traversable which contains the root paths
   *   keyed by the corresponding namespace to look for plugin implementations.
   * @param \Drupal\Core\Cache\CacheBackendInterface $cache_backend
   *   Cache backend instance to use.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   */
  public function __construct(\Traversable $namespaces, CacheBackendInterface $cache_backend, ModuleHandlerInterface $module_handler) {
    parent::__construct('Plugin/QueueUI', $namespaces, $module_handler, 'Drupal\queue_ui\QueueUIInterface', 'Drupal\queue_ui\Annotation\QueueUI');

    $this->setCacheBackend($cache_backend, 'queue_ui_plugins');
    $this->alterInfo('queue_ui_info');
  }

  /**
   * @param $queue_name
   *
   * @return bool|object
   */
  public function fromQueueName($queue_name) {
    $queue = \Drupal::queue($queue_name);

    try {
      foreach ($this->getDefinitions() as $definition) {
        if ($definition['class_name'] == $this->queueClassName($queue)) {
          return parent::createInstance($definition['id']);
        }
      }
    }
    catch (\Exception $e) {}

    return FALSE;
  }

  /**
   * @param $queue
   *
   * @return mixed
   */
  public function queueClassName($queue) {
    $namespace = explode('\\', get_class($queue));
    return array_pop($namespace);
  }

}
