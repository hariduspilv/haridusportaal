<?php

namespace Drupal\config_distro_ignore\Controller;

use Drupal\config\Controller\ConfigController;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Returns responses for config module routes.
 */
class ConfigDistroIgnoreController implements ContainerInjectionInterface {

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {

  }

  /**
   * {@inheritdoc}
   */
  public function diff($source_name, $target_name = NULL, $collection = NULL) {
    $build = parent::diff($source_name, $target_name = NULL, $collection = NULL);
    $build['back']['#url'] = Url::fromRoute('config_distro.import');
    return $build;
  }

}
