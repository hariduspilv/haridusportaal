<?php

namespace Drupal\purge_queuer_test\Plugin\Purge\Queuer;

use Drupal\purge\Plugin\Purge\Queuer\QueuerBase;
use Drupal\purge\Plugin\Purge\Queuer\QueuerInterface;

/**
 * Test queuer C.
 *
 * @PurgeQueuer(
 *   id = "c",
 *   label = @Translation("Queuer C"),
 *   description = @Translation("Test queuer C."),
 *   enable_by_default = false,
 *   configform = "",
 * )
 */
class CQueuer extends QueuerBase implements QueuerInterface {}
