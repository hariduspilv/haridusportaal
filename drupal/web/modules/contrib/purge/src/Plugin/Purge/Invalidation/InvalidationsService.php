<?php

namespace Drupal\purge\Plugin\Purge\Invalidation;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\purge\ServiceBase;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\TypeUnsupportedException;
use Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface;
use Drupal\purge\Plugin\Purge\Invalidation\ImmutableInvalidation;
use Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface;
use Drupal\purge\Plugin\Purge\Queue\ProxyItemInterface;

/**
 * Provides a service that instantiates invalidation objects on-demand.
 */
class InvalidationsService extends ServiceBase implements InvalidationsServiceInterface {

  /**
   * Incremental ID counter for handing out unique instance IDs.
   *
   * @var int
   */
  protected $instance_counter = 0;

  /**
   * As immutable instances cannot change the queue, they are counted negative
   * and the counter only decrements. Its IDs can never clash with real ones.
   *
   * @var int
   */
  protected $instance_counter_immutables = -1;

  /**
   * @var \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface
   */
  protected $purgePurgers;

  /**
   * Instantiates a \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsService.
   *
   * @param \Drupal\Component\Plugin\PluginManagerInterface $pluginManager
   *   The plugin manager for this service.
   * @param \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface $purge_purgers
   *   The purgers service.
   */
  public function __construct(PluginManagerInterface $pluginManager, PurgersServiceInterface $purge_purgers) {
    $this->pluginManager = $pluginManager;
    $this->purgePurgers = $purge_purgers;
  }

  /**
   * Retrieve a new instance from the plugin manager.
   *
   * @param string $plugin_id
   *   The id of the invalidation type being instantiated.
   * @param mixed|null $expression
   *   Value - usually string - that describes the kind of invalidation, NULL
   *   when the type of invalidation doesn't require $expression. Types usually
   *   validate the given expression and throw exceptions for bad input.
   * @param int $id
   *   The numeric identifier of this instance.
   *
   * @return \Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface
   */
  protected function createInstance($plugin_id, $expression, $id) {
    return $this->pluginManager->createInstance(
      $plugin_id, [
        'expression' => $expression,
        'id' => $id
      ]
    );
  }

  /**
   * {@inheritdoc}
   */
  public function get($plugin_id, $expression = NULL) {
    if (!in_array($plugin_id, $this->purgePurgers->getTypes())) {
      throw new TypeUnsupportedException($plugin_id);
    }
    $id = $this->instance_counter++;
    return $this->createInstance($plugin_id, $expression, $id);
  }

  /**
   * {@inheritdoc}
   */
  public function getImmutable($plugin_id, $expression = NULL) {
    $id = $this->instance_counter_immutables--;
    return new ImmutableInvalidation($this->createInstance($plugin_id, $expression, $id));
  }

  /**
   * {@inheritdoc}
   */
  public function getFromQueueData($item_data) {
    $instance = $this->createInstance(
      $item_data[ProxyItemInterface::DATA_INDEX_TYPE],
      $item_data[ProxyItemInterface::DATA_INDEX_EXPRESSION],
      $this->instance_counter++
    );

    // Replay stored purger states.
    if (isset($item_data[ProxyItemInterface::DATA_INDEX_STATES])) {
      foreach ($item_data[ProxyItemInterface::DATA_INDEX_STATES] as $id => $state) {
        $instance->setStateContext($id);
        $instance->setState($state);
      }
      $instance->setStateContext(NULL);
    }

    // Replay stored properties.
    if (isset($item_data[ProxyItemInterface::DATA_INDEX_PROPERTIES])) {
      foreach ($item_data[ProxyItemInterface::DATA_INDEX_PROPERTIES] as $id => $properties) {
        $instance->setStateContext($id);
        foreach ($properties as $key => $value) {
          $instance->setProperty($key, $value);
        }
      }
      $instance->setStateContext(NULL);
    }

    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function getImmutableFromQueueData($item_data) {
    $instance = $this->createInstance(
      $item_data[ProxyItemInterface::DATA_INDEX_TYPE],
      $item_data[ProxyItemInterface::DATA_INDEX_EXPRESSION],
      $this->instance_counter_immutables--
    );

    // Replay stored purger states.
    if (isset($item_data[ProxyItemInterface::DATA_INDEX_STATES])) {
      foreach ($item_data[ProxyItemInterface::DATA_INDEX_STATES] as $id => $state) {
        $instance->setStateContext($id);
        $instance->setState($state);
      }
      $instance->setStateContext(NULL);
    }

    // Replay stored properties.
    if (isset($item_data[ProxyItemInterface::DATA_INDEX_PROPERTIES])) {
      foreach ($item_data[ProxyItemInterface::DATA_INDEX_PROPERTIES] as $id => $properties) {
        $instance->setStateContext($id);
        foreach ($properties as $key => $value) {
          $instance->setProperty($key, $value);
        }
      }
      $instance->setStateContext(NULL);
    }

    return new ImmutableInvalidation($instance);
  }

}
