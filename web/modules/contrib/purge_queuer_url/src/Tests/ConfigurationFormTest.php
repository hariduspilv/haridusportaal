<?php

namespace Drupal\purge_queuer_url\Tests;

use Drupal\purge_ui\Tests\QueuerConfigFormTestBase;

/**
 * Tests \Drupal\purge_queuer_url\Form\ConfigurationForm.
 *
 * @group purge
 */
class ConfigurationFormTest extends QueuerConfigFormTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_queuer_url'];

  /**
   * The plugin ID for which the form tested is rendered for.
   *
   * @var string
   */
  protected $plugin = 'urlpath';

  /**
   * The full class of the form being tested.
   *
   * @var string
   */
  protected $formClass = 'Drupal\purge_queuer_url\Form\ConfigurationForm';

  /**
   * Test the blacklist section.
   *
   * @TODO add tests for the blacklist.
   */
  public function testFieldExistence() {
    $this->drupalLogin($this->admin_user);
    $this->drupalGet($this->route);
    // Assert the standard fields and their default values.
    $this->assertField('edit-queue-paths');
    $this->assertNoFieldChecked('edit-queue-paths');
    $this->assertField('edit-host-override');
    $this->assertNoFieldChecked('edit-host-override');
    $this->assertField('edit-host');
    $this->assertFieldById('edit-host', '');
    $this->assertField('edit-scheme-override');
    $this->assertNoFieldChecked('edit-scheme-override');
    $this->assertField('edit-scheme');
    $this->assertFieldById('edit-scheme', 'http');
    $this->assertRaw('Clear traffic history');
    // Test that direct configuration changes are reflected properly.
    $this->config('purge_queuer_url.settings')
      ->set('queue_paths', TRUE)
      ->set('host_override', TRUE)
      ->set('host', 'foobar.baz')
      ->set('scheme_override', TRUE)
      ->set('scheme', 'https')
      ->save();
    $this->drupalGet($this->route);
    $this->assertFieldChecked('edit-queue-paths');
    $this->assertFieldChecked('edit-host-override');
    $this->assertFieldById('edit-host', 'foobar.baz');
    $this->assertFieldChecked('edit-scheme-override');
    $this->assertFieldById('edit-scheme', 'https');
  }

}
