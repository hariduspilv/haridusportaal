<?php

namespace Drupal\openid_connect\Tests;

use Drupal\simpletest\WebTestBase;

/**
 * Provides tests for the settings form.
 *
 * @group openid_connect
 */
class SettingsFormTest extends WebTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['openid_connect'];

  /**
   * A regular user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $webUser;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->webUser = $this->drupalCreateUser([
      'administer site configuration',
    ]);
  }

  /**
   * Tests the OpenID connect settings form.
   */
  public function testUpdateSettings() {
    $this->drupalLogin($this->webUser);
    $this->drupalGet('admin/config/services/openid-connect');

    // Override the default values.
    $edit = [
      'always_save_userinfo' => FALSE,
      'override_registration_settings' => TRUE,
    ];

    $this->drupalPostForm(NULL, $edit, 'Save configuration', [], [], 'openid-connect-admin-settings');

    // Check the config was updated.
    $config_factory = $this->container->get('config.factory');
    /* @var \Drupal\Core\Config\Config $config */
    $config = $config_factory->get('openid_connect.settings');

    $user_info = $config->get('always_save_userinfo');
    $this->assertFalse($user_info);

    $override_registration_settings = $config->get('override_registration_settings');
    $this->assertTrue($override_registration_settings);
  }

}
