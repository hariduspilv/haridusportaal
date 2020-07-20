<?php

namespace Drupal\purge\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a PurgeProcessor annotation object.
 *
 * @Annotation
 */
class PurgeProcessor extends Plugin {

  /**
   * The plugin ID of the processor plugin.
   *
   * @var string
   */
  public $id;

  /**
   * The human-readable name of the processor plugin.
   *
   * @var \Drupal\Core\Annotation\Translation
   * @ingroup plugin_translatable
   */
  public $label;

  /**
   * The description of the processor plugin.
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
   * Class name of the configuration form of your processor.
   *
   * Full class name of the configuration form of your processor, with leading
   * backslash. Class must extend \Drupal\purge_ui\Form\ProcessorConfigFormBase.
   *
   * @var string
   */
  public $configform = '';

}
