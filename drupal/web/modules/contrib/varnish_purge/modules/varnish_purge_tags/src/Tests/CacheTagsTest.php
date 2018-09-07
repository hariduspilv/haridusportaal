<?php

namespace Drupal\varnish_purge_tags\Tests;

use Symfony\Component\HttpFoundation\Request;
use Drupal\purge\Tests\KernelTestBase;

/**
 * Tests \Drupal\varnish_purge_tags\Plugin\Purge\Tags\CacheTags.
 *
 * @group varnish_purge_tags
 */
class CacheTagsTest extends KernelTestBase {
  public static $modules = ['system', 'varnish_purge_tags'];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->installSchema('system', ['router']);
    \Drupal::service('router.builder')->rebuild();
  }

  /**
   * Test that the header value is exactly as expected (space separated).
   */
  public function testHeaderValue() {
    $request = Request::create('/system/401');
    $response = $this->container->get('http_kernel')->handle($request);
    $this->assertEqual(200, $response->getStatusCode());
    $this->assertEqual($response->headers->get('Cache-Tags'), 'config:user.role.anonymous rendered');
  }

}
