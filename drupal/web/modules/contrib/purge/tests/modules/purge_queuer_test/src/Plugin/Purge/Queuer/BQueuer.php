<?php

namespace Drupal\purge_queuer_test\Plugin\Purge\Queuer;

use Drupal\purge\Plugin\Purge\Queuer\QueuerBase;
use Drupal\purge\Plugin\Purge\Queuer\QueuerInterface;

/**
 * Test queuer B.
 *
 * @PurgeQueuer(
 *   id = "b",
 *   label = @Translation("Queuer B"),
 *   description = @Translation("Test queuer B."),
 *   enable_by_default = true,
 *   configform = "",
 * )
 */
class BQueuer extends QueuerBase implements QueuerInterface {}
