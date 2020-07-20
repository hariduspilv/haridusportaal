<?php

namespace Drupal\purge\Tests;

/**
 * Thin and generic KTB for testing services.yml exposed classes.
 *
 * @see \Drupal\purge\Tests\KernelTestBase
 * @see \Drupal\purge\Tests\ServiceTestTrait
 */
abstract class KernelServiceTestBase extends KernelTestBase {
  use ServiceTestTrait;

}
