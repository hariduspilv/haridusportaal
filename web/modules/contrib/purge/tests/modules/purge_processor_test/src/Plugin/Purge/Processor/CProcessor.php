<?php

namespace Drupal\purge_processor_test\Plugin\Purge\Processor;

use Drupal\purge\Plugin\Purge\Processor\ProcessorBase;
use Drupal\purge\Plugin\Purge\Processor\ProcessorInterface;

/**
 * Test processor C.
 *
 * @PurgeProcessor(
 *   id = "c",
 *   label = @Translation("Processor C"),
 *   description = @Translation("Test processor C."),
 *   enable_by_default = false,
 *   configform = "",
 * )
 */
class CProcessor extends ProcessorBase implements ProcessorInterface {

}
