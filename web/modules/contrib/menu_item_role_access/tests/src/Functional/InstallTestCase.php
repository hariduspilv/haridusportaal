<?php

namespace Drupal\Tests\menu_item_role_access\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Test the module installs correctly.
 *
 * @group menu
 */
class InstallTestCase extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'menu_ui',
    'menu_link_content',
    'menu_item_role_access',
  ];

  /**
   * Make sure the site still works. For now just check the front page.
   */
  public function testTheSiteStillWorks() {
    // Load the front page.
    $this->drupalGet('<front>');

    // Confirm that the site didn't throw a server error or something else.
    $this->assertSession()->statusCodeEquals(200);
  }

}
