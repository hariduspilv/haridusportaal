<?php

namespace Drupal\htm_custom_xjson_services\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for X json form entity entities.
 */
class xJsonFormEntityViewsData extends EntityViewsData {

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
