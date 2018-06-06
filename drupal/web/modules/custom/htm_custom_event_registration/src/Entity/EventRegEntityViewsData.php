<?php

namespace Drupal\htm_custom_event_registration\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Event registration entities.
 */
class EventRegEntityViewsData extends EntityViewsData {

  /**
   * {@inheritdoc}
   */
  public function getViewsData() {
    $data = parent::getViewsData();

    // Additional information for Views integration, such as table joins, can be
    // put here.

    return $data;
  }

}
