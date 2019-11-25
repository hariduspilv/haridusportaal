<?php

namespace Drupal\purge\Annotation;

use Drupal\Component\Annotation\Plugin;

/**
 * Defines a PurgeTagsHeader annotation object.
 *
 * @Annotation
 */
class PurgeTagsHeader extends Plugin {

  /**
   * The plugin ID of the tagsheader.
   *
   * @var string
   */
  public $id;

  /**
   * The HTTP response header that the plugin sets.
   *
   * @var string
   *
   * @warning
   *   In RFC #6648 the use of 'X-' as header prefixes has been deprecated
   *   for "application protocols", this naturally includes Drupal. Therefore
   *   if this is possible, consider header names without this prefix.
   */
  public $header_name; // phpcs:ignore -- annotation property!

  /**
   * Required purger plugins.
   *
   * When your tags header is specific for a certain purger plugin(s) you
   * can bind it to these plugins. This tags header will then only get loaded
   * when any of these specified purgers are in active use.
   *
   * @var array
   *
   * @code
   * dependent_purger_plugins = {"mypurger"}
   * @endcode
   */
  public $dependent_purger_plugins = []; // phpcs:ignore -- annotation property!

}
