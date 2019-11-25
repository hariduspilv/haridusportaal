<?php

namespace Drupal\purge\Tests\Invalidation;

/**
 * Tests \Drupal\purge\Plugin\Purge\Invalidation\TagInvalidation.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface
 */
class TagInvalidationTest extends PluginTestBase {

  /**
   * The plugin ID of the invalidation type being tested.
   *
   * @var string
   */
  protected $pluginId = 'tag';

  /**
   * String expressions valid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressions = [
    'tag',
    'user:1',
    'menu:footer',
  ];

  /**
   * String expressions invalid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressionsInvalid = [
    NULL,
    '',
    ['node', '1'],
    'wildtag:*',
  ];

}
