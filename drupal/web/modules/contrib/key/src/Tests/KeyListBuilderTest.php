<?php

namespace Drupal\key\Tests;

use Drupal\simpletest\WebTestBase;

/**
 * Tests the key list builder.
 *
 * @group key
 */
class KeyListBuilderTest extends WebTestBase {

  public static $modules = ['key', 'dblog'];

  /**
   * Test KeyListBuilder functions.
   */
  public function testListBuilder() {
    // Create user with permission to administer keys.
    $user1 = $this->drupalCreateUser(['administer keys']);
    $this->drupalLogin($user1);

    // Go to the Key list page.
    $this->drupalGet('admin/config/system/keys');

    // Verify that the "no keys" message displays.
    $this->assertText(t('No keys are available. Add a key.'));

    // Add a key.
    $this->drupalGet('admin/config/system/keys/add');
    $edit = [
      'key_provider' => 'config',
    ];
    $this->drupalPostAjaxForm(NULL, $edit, 'key_provider');

    $edit = [
      'id' => 'testing_key',
      'label' => 'Testing Key',
      'key_provider' => 'config',
      'key_input_settings[key_value]' => 'mustbesixteenbit',
    ];
    $this->drupalPostForm(NULL, $edit, t('Save'));

    // Go to the Key list page.
    $this->drupalGet('admin/config/system/keys');

    // Verify that the "no keys" message does not display.
    $this->assertNoText(t('No keys are available. Add a key.'));
  }

}
