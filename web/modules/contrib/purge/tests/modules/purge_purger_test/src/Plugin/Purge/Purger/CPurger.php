<?php

namespace Drupal\purge_purger_test\Plugin\Purge\Purger;

/**
 * Test purger C.
 *
 * @PurgePurger(
 *   id = "c",
 *   label = @Translation("Purger C"),
 *   configform = "",
 *   cooldown_time = 0.0,
 *   description = @Translation("Test purger C."),
 *   multi_instance = FALSE,
 *   types = {"wildcardpath", "wildcardurl"},
 * )
 */
class CPurger extends NullPurgerBase {}
