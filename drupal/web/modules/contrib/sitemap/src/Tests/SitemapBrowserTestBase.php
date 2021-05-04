<?php

namespace Drupal\sitemap\Tests;

use Drupal\Tests\BrowserTestBase;

abstract class SitemapBrowserTestBase extends BrowserTestBase {

  protected $defaultTheme = 'stark';

  /**
   * Save the sitemap form with the provided configuration.
   *
   * @param array $edit
   */
  protected function saveSitemapForm($edit = []) {
    $this->drupalPostForm('admin/config/search/sitemap', $edit, t('Save configuration'));
  }

}
