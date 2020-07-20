<?php

namespace Drupal\purge\Tests\Invalidation;

/**
 * Tests \Drupal\purge\Plugin\Purge\Invalidation\WildcardPathInvalidation.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Invalidation\InvalidationInterface
 */
class WildcardPathInvalidationTest extends PluginTestBase {

  /**
   * The plugin ID of the invalidation type being tested.
   *
   * @var string
   */
  protected $pluginId = 'wildcardpath';

  /**
   * String expressions valid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressions = [
    '*',
    '*?page=0',
    'news/*',
    'products/*',
  ];

  /**
   * String expressions invalid to the invalidation type being tested.
   *
   * @var string[]|null
   */
  protected $expressionsInvalid = [
    NULL,
    '',
    '/*',
    '/',
    '?page=0',
    'news',
    'news/',
    '012/442',
    'news/article-1',
    'news/article-1?page=0&secondparam=1',
  ];

}
