<?php

namespace Drupal\content_sync\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a Sync normalizer decorator item annotation object.
 *
 * @see \Drupal\content_sync\Plugin\SyncNormalizerDecoratorManager
 * @see plugin_api
 *
 * @Annotation
 */
class SyncNormalizerDecorator extends Plugin {


  /**
   * The plugin ID.
   *
   * @var string
   */
  public $id;

  /**
   * The label of the plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   *
   * @ingroup plugin_translatable
   */
  public $label;

}
