<?php

namespace Drupal\purge\Tests\Invalidation;

/**
 * Tests \Drupal\purge\Plugin\Purge\Invalidation\PathInvalidation.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface
 */
class PathInvalidationTest extends PluginTestBase {

  /**
   * The plugin ID of the invalidation type being tested.
   *
   * @var string
   */
  protected $pluginId = 'path';

  /**
   * String expressions valid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressions = [
    '',
    '?page=0',
    'news',
    'news/',
    '012/442',
    'news/article-1',
    'news/article-1?page=0&secondparam=1',
  ];

  /**
   * String expressions invalid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressionsInvalid = [
    NULL,
    '/news',
    'news/*',
    '/news/*',
    '*',
  ];

}
