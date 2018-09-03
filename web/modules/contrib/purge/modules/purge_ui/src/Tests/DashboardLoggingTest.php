<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge_ui\Tests\DashboardTestBase;

/**
 * Tests \Drupal\purge_ui\Controller\DashboardController::buildLoggingSection().
 *
 * @group purge_ui
 */
class DashboardLoggingTest extends DashboardTestBase {

  /**
   * Test the logging section of the configuration form.
   *
   * @see \Drupal\purge_ui\Controller\DashboardController::buildLoggingSection
   */
  public function testLoggingSection() {
    $this->drupalLogin($this->admin_user);
    $this->drupalGet($this->route);
    $this->assertRaw('Logging');
    $this->assertRaw('Configure logging behavior');
    $this->assertLinkByHref(Url::fromRoute('purge_ui.logging_config_form')->toString());
  }

}
