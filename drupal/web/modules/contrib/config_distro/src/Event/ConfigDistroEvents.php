<?php

namespace Drupal\config_distro\Event;

/**
 * Defines the events for Default Content.
 *
 * @see \Drupal\config_distro\Event\ImportEvent
 */
final class ConfigDistroEvents {

  /**
   * Name of the event fired when finishing import of distribution config.
   *
   * This event allows modules to perform actions after the configuration has
   * been imported.
   *
   * @Event
   *
   * @see \Drupal\config_distro\Event\ImportEvent
   *
   * @var string
   */
  const IMPORT = 'config_distro.import';

}
