<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge_ui\Tests\DashboardTestBase;

/**
 * Tests \Drupal\purge_ui\Controller\DashboardController::buildPurgers().
 *
 * @group purge_ui
 */
class DashboardPurgersTest extends DashboardTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_purger_test'];

  /**
   * Test the purgers section of the configuration form.
   *
   * @warning
   *   This test depends on raw HTML, which is a bit of a maintenance cost. At
   *   the same time, core's markup guarantees should keep us safe. Having that
   *   said, for the purpose of testing, raw HTML checking is very accurate :-).
   *
   * @see \Drupal\purge_ui\Controller\DashboardController::buildPurgers
   */
  public function testPurgersSection() {
    $this->drupalLogin($this->admin_user);
    // Assert that without any enabled purgers, the form stays empty.
    $this->initializePurgersService();
    $this->drupalGet($this->route);
    $this->assertRaw('Each layer of caching on top of your site is cleared by a purger. Purgers are provided by third-party modules and support one or more types of cache invalidation.');
    $this->assertRaw('Drupal Origin');
    $this->assertRaw('Public Endpoint');
    $this->assertNoRaw('Purger A</th>');
    $this->assertNoRaw('Purger B</th>');
    $this->assertNoRaw('Purger C</th>');
    $this->assertNoRaw('Configurable purger</th>');
    // Assert that enabled purgers show up and have the right buttons attached.
    $this->initializePurgersService(['a', 'withform']);
    $this->drupalGet($this->route);
    $this->assertRaw('Purger A</a>');
    $this->assertRaw('Configurable purger</a>');
    $purger_0_route_params = ['id' => 'id0'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.purger_detail_form', $purger_0_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.purger_config_dialog_form', $purger_0_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.purger_delete_form', $purger_0_route_params)->toString());
    $purger_1_route_params = ['id' => 'id1'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.purger_detail_form', $purger_1_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.purger_config_dialog_form', $purger_1_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.purger_delete_form', $purger_1_route_params)->toString());
    // Assert that the purger-type supportability matrix shows the checkmarks.
    $expected_checkmark_image_url = file_url_transform_relative(file_create_url('core/misc/icons/73b355/check.svg'));
    $this->assertFalse(empty($this->cssSelect('img[width=18][height=18][alt=Supported][title=Supported][src="' . $expected_checkmark_image_url . '"]')));
    $this->assertNoRaw('<img supports="drupal-domain"');
    $this->assertNoRaw('<img supports="drupal-path"');
    $this->assertRaw('<img supports="drupal-tag"');
    $this->assertNoRaw('<img supports="drupal-regex"');
    $this->assertNoRaw('<img supports="drupal-wildcardpath"');
    $this->assertNoRaw('<img supports="drupal-wildcardurl"');
    $this->assertNoRaw('<img supports="drupal-url"');
    $this->assertNoRaw('<img supports="drupal-everything"');
    $this->assertNoRaw('<img supports="id0-domain"');
    $this->assertNoRaw('<img supports="id0-path"');
    $this->assertNoRaw('<img supports="id0-tag"');
    $this->assertNoRaw('<img supports="id0-regex"');
    $this->assertNoRaw('<img supports="id0-wildcardpath"');
    $this->assertNoRaw('<img supports="id0-wildcardurl"');
    $this->assertNoRaw('<img supports="id0-url"');
    $this->assertRaw('<img supports="id0-everything"');
    $this->assertNoRaw('<img supports="id1-domain"');
    $this->assertRaw('<img supports="id1-path"');
    $this->assertNoRaw('<img supports="id1-tag"');
    $this->assertNoRaw('<img supports="id1-regex"');
    $this->assertNoRaw('<img supports="id1-wildcardpath"');
    $this->assertNoRaw('<img supports="id1-wildcardurl"');
    $this->assertNoRaw('<img supports="id1-url"');
    $this->assertNoRaw('<img supports="id1-everything"');
    // Assert that the 'Add purger' button only shows up when it actually should.
    $this->assertRaw(t('Add purger'));
    $this->initializePurgersService(['a', 'b', 'c', 'withform', 'good']);
    $this->drupalGet($this->route);
    $this->assertNoRaw(t('Add purger'));
  }

}
