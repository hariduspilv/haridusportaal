<?php

namespace Drupal\htm_custom_xjson_services\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for xJson entity entities.
 */
class xJsonEntityViewsData extends EntityViewsData {

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
