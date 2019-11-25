<?php

namespace Drupal\purge\Plugin\Purge\Queuer;

use Drupal\purge\ModifiableServiceInterface;
use Drupal\purge\ServiceInterface;

/**
 * Describes a service that provides access to loaded queuers.
 */
interface QueuersServiceInterface extends ServiceInterface, ModifiableServiceInterface, \Iterator, \Countable {

  /**
   * Get the requested queuer instance.
   *
   * @param string $plugin_id
   *   The plugin ID of the queuer you want to retrieve.
   *
   * @return \Drupal\purge\Plugin\Purge\Queuer\QueuerInterface|false
   *   The queue plugin or FALSE when it isn't available.
   */
  public function get($plugin_id);

}
