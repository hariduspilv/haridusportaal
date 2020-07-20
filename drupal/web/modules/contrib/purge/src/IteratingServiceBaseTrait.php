<?php

namespace Drupal\purge;

/**
 * Adds \Iterator logic to \Drupal\purge\ServiceInterface derivatives.
 */
trait IteratingServiceBaseTrait {

  /**
   * Current iterator position.
   *
   * @var int
   *
   * @ingroup iterator
   */
  protected $position = 0;

  /**
   * Holds all instantiated plugins.
   *
   * @var null|\Drupal\Component\Plugin\PluginInspectionInterface[]
   */
  protected $instances;

  /**
   * Instantiate all enabled plugins or check that they are present.
   */
  protected function initializePluginInstances() {
    if (!is_null($this->instances)) {
      return;
    }
    $this->instances = [];
    foreach ($this->getPluginsEnabled() as $plugin_id) {
      $this->instances[] = $this->pluginManager->createInstance($plugin_id);
    }
  }

  /**
   * Return the current element.
   *
   * @ingroup iterator
   */
  public function current() {
    $this->initializePluginInstances();
    if ($this->valid()) {
      return $this->instances[$this->position];
    }
    return FALSE;
  }

  /**
   * Return the key of the current element.
   *
   * @ingroup iterator
   */
  public function key() {
    $this->initializePluginInstances();
    return $this->position;
  }

  /**
   * Move forward to next element.
   *
   * @ingroup iterator
   */
  public function next() {
    $this->initializePluginInstances();
    ++$this->position;
  }

  /**
   * Rewind the iterator and destruct loaded plugin instances.
   *
   * @warning
   *   Reloading a service implies that all cached data will be reset and that
   *   plugins get reinstantiated during the current request, which should
   *   normally not be used. This method is specifically used in tests.
   *
   * @see \Drupal\purge\ServiceInterface::reload()
   */
  protected function reloadIterator() {
    $this->instances = NULL;
    $this->rewind();
  }

  /**
   * Rewind the Iterator to the first element.
   *
   * @ingroup iterator
   */
  public function rewind() {
    $this->position = 0;
  }

  /**
   * Checks if current position is valid.
   *
   * @ingroup iterator
   */
  public function valid() {
    $this->initializePluginInstances();
    return isset($this->instances[$this->position]);
  }

}
