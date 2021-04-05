<?php

namespace Drupal\sitemap\Tests;

/**
 * Tests the inclusion of the sitemap css file based on sitemap settings.
 *
 * @group sitemap
 */
class SitemapCssTest extends SitemapTestBase {

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->drupalLogin($this->userAdmin);
  }

  /**
   * Tests include css file.
   */
  public function testIncludeCssFile() {
    // Assert that css file is included by default.
    $this->drupalGet('/sitemap');
    $this->assertRaw('sitemap.theme.css');

    // Change module not to include css file.
    $this->saveSitemapForm(['include_css' => FALSE]);
    drupal_flush_all_caches();

    // Assert that css file is not included.
    $this->drupalGet('/sitemap');
    $this->assertNoRaw('sitemap.theme.css');
  }

}
