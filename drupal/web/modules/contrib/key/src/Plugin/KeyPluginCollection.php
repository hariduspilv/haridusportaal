<?php

namespace Drupal\key\Plugin;

use Drupal\Core\Plugin\DefaultSingleLazyPluginCollection;

/**
 * Provides a container for lazily loading key plugins.
 */
class KeyPluginCollection extends DefaultSingleLazyPluginCollection {

  /**
   * {@inheritdoc}
   *
   * @return \Drupal\key\Plugin\KeyPluginInterface
   *   A Key plugin instance.
   */
  public function &get($instance_id) {
    return parent::get($instance_id);
  }

  /**
   * {@inheritdoc}
   */
  public function addInstanceId($id, $configuration = NULL) {
    $this->instanceId = $id;
    parent::addInstanceId($id, $configuration);
    if ($configuration !== NULL) {
      $this->setConfiguration($configuration);
    }
  }

}
