<?php

namespace Drupal\sitemap\Tests;

use Drupal\Tests\BrowserTestBase;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Test behaviors when saving the sitemap form.
 *
 * @group sitemap
 */
abstract class SitemapBrowserTestBase extends BrowserTestBase {
  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Save the sitemap form with the provided configuration.
   *
   * @param array $edit
   *   The array with the form fields.
   */
  protected function saveSitemapForm(array $edit = []) {
    $this->drupalPostForm('admin/config/search/sitemap', $edit, $this->t('Save configuration'));
  }

}
