<?php

namespace Drupal\purge\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a PurgeQueuer annotation object.
 *
 * @Annotation
 */
class PurgeQueuer extends Plugin {

  /**
   * The plugin ID of the queuer plugin.
   *
   * @var string
   */
  public $id;

  /**
   * The human-readable name of the queuer plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   * @ingroup plugin_translatable
   */
  public $label;

  /**
   * The description of the queuer plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   * @ingroup plugin_translatable
   */
  public $description;

  /**
   * Whether the plugin needs to auto enable when first discovered.
   *
   * @var bool
   */
  public $enable_by_default = FALSE; // phpcs:ignore -- annotation property!

  /**
   * Class name of the configuration form of your queuer.
   *
   * Full class name of the configuration form of your queuer, with leading
   * backslash. Class must extend \Drupal\purge_ui\Form\QueuerConfigFormBase.
   *
   * @var string
   */
  public $configform = '';

}
