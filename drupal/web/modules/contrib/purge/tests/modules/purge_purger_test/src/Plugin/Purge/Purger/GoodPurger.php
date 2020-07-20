<?php

namespace Drupal\purge_purger_test\Plugin\Purge\Purger;

use Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface;

/**
 * A purger that always succeeds.
 *
 * @PurgePurger(
 *   id = "good",
 *   label = @Translation("Good Purger"),
 *   configform = "",
 *   cooldown_time = 1.0,
 *   description = @Translation("A purger that always succeeds."),
 *   multi_instance = FALSE,
 *   types = {"tag", "regex", "url", "path", "domain", "everything",
 *            "wildcardpath", "wildcardurl"},
 * )
 */
class GoodPurger extends NullPurgerBase {

  /**
   * {@inheritdoc}
   */
  public function invalidate(array $invalidations) {
    foreach ($invalidations as $invalidation) {
      $invalidation->setState(InvalidationInterface::SUCCEEDED);
    }
  }

}
