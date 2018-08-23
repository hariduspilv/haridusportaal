<?php

namespace Drupal\htm_custom_subsidy_projects\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Subsidy project entities.
 */
class SubsidyProjectEntityViewsData extends EntityViewsData {

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
