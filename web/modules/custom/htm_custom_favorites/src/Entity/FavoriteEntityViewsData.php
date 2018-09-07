<?php

namespace Drupal\htm_custom_favorites\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Favorite entities.
 */
class FavoriteEntityViewsData extends EntityViewsData {

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
