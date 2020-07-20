<?php

namespace Drupal\purge\Tests\Invalidation;

/**
 * Tests \Drupal\purge\Plugin\Purge\Invalidation\RegularExpressionInvalidation.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface
 */
class RegularExpressionInvalidationTest extends PluginTestBase {

  /**
   * The plugin ID of the invalidation type being tested.
   *
   * @var string
   */
  protected $pluginId = 'regex';

  /**
   * String expressions valid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressions = ['\.(jpg|jpeg|css|js)$'];

  /**
   * String expressions invalid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressionsInvalid = [NULL, ''];

}
