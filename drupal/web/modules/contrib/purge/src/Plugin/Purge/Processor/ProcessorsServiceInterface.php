<?php

namespace Drupal\purge\Plugin\Purge\Processor;

use Drupal\purge\ModifiableServiceInterface;
use Drupal\purge\ServiceInterface;

/**
 * Describes a service that provides access to loaded processors.
 */
interface ProcessorsServiceInterface extends ServiceInterface, ModifiableServiceInterface, \Iterator, \Countable {

  /**
   * Get the requested processor instance.
   *
   * @param string $plugin_id
   *   The plugin ID of the processor you want to retrieve.
   *
   * @return \Drupal\purge\Plugin\Purge\Processor\ProcessorInterface|false
   *   The processor plugin or FALSE when it isn't available.
   */
  public function get($plugin_id);

}
