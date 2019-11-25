<?php

namespace Drupal\purge_coretags_removed_test;

use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Core\DependencyInjection\ServiceModifierInterface;

/**
 * Remove "purge_queuer_coretags.queuer" from the container.
 */
class PurgeCoretagsRemovedTestServiceProvider implements ServiceModifierInterface {

  /**
   * {@inheritdoc}
   */
  public function alter(ContainerBuilder $container) {
    $container->removeDefinition('purge_queuer_coretags.queuer');
  }

}
