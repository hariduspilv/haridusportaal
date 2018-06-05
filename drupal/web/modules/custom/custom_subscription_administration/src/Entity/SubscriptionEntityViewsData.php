<?php

namespace Drupal\custom_subscription_administration\Entity;

use Drupal\views\EntityViewsData;

/**
 * Provides Views data for Subscription entity entities.
 */
class SubscriptionEntityViewsData extends EntityViewsData {

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
