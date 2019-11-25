<?php

namespace Drupal\purge\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a PurgeQueue annotation object.
 *
 * @Annotation
 */
class PurgeQueue extends Plugin {

  /**
   * The plugin ID of the queue plugin.
   *
   * @var string
   */
  public $id;

  /**
   * The human-readable name of the queue plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   * @ingroup plugin_translatable
   */
  public $label;

  /**
   * The description of the queue plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   * @ingroup plugin_translatable
   */
  public $description;

}
