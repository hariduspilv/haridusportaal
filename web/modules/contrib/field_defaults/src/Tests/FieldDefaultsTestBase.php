<?php

namespace Drupal\field_defaults\Tests;

use Drupal\Tests\BrowserTestBase;

/**
 * Class FieldDefaultsTestBase.
 */
class FieldDefaultsTestBase extends BrowserTestBase {

  /**
   * The administrator account.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $administratorAccount;

  /**
   * The field name.
   *
   * @var string
   */
  protected $fieldName;

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['block', 'node', 'field_ui', 'field_defaults'];

  /**
   * {@inheritdoc}
   *
   * Once installed, a content type with the desired field is created.
   */
  protected function setUp() {
    // Install Drupal.
    parent::setUp();

    // Add the system menu blocks to appropriate regions.
    $this->setupMenus();

    // Create a Content type and some nodes.
    $this->drupalCreateContentType(['type' => 'page']);

    // Create and login a user that creates the content type.
    $permissions = [
      'administer nodes',
      'administer content types',
      'administer node fields',
      'edit any page content',
      'administer field defaults',
    ];
    $this->administratorAccount = $this->drupalCreateUser($permissions);
    $this->drupalLogin($this->administratorAccount);

    // Create some dummy content.
    for ($i = 0; $i < 20; $i++) {
      $this->drupalCreateNode();
    }
  }

  /**
   * Set up menus and tasks in their regions.
   *
   * Since menus and tasks are now blocks, we're required to explicitly set them
   * to regions.
   *
   * Note that subclasses must explicitly declare that the block module is a
   * dependency.
   */
  protected function setupMenus() {
    $this->drupalPlaceBlock('system_menu_block:tools', ['region' => 'primary_menu']);
    $this->drupalPlaceBlock('local_tasks_block', ['region' => 'secondary_menu']);
    $this->drupalPlaceBlock('local_actions_block', ['region' => 'content']);
    $this->drupalPlaceBlock('page_title_block', ['region' => 'content']);
  }

  /**
   * Creates a field on a content entity.
   */
  protected function createField($type = 'boolean', $cardinality = '1', $contentType = 'page') {
    $this->drupalGet('admin/structure/types/manage/' . $contentType . '/fields');

    // Go to the 'Add field' page.
    $this->clickLink('Add field');

    // Make a name for this field.
    $field_name = strtolower($this->randomMachineName(10));

    // Fill out the field form.
    $edit = [
      'new_storage_type' => $type,
      'field_name' => $field_name,
      'label' => $field_name,
    ];
    $this->drupalPostForm(NULL, $edit, t('Save and continue'));

    // Fill out the $cardinality form as if we're not using an unlimited values.
    $edit = [
      'cardinality' => 'number',
      'cardinality_number' => (string) $cardinality,
    ];
    // -1 for $cardinality, we should change to 'Unlimited'.
    if (-1 == $cardinality) {
      $edit = [
        'cardinality' => '-1',
        'cardinality_number' => '1',
      ];
    }

    // And now we save the cardinality settings.
    $this->drupalPostForm(NULL, $edit, t('Save field settings'));
    $this->assertText(t('Updated field @name field settings.', ['@name' => $field_name]));

    // Save.
    $this->drupalPostForm(NULL, [], t('Save settings'));
    $this->assertText(t('Saved @name configuration.', ['@name' => $field_name]));

    return $field_name;
  }

  /**
   * Sets a default value and runs the batch update.
   *
   * @TODO: Add support for cardinality
   * @TODO: Add support for language
   */
  protected function setDefaultValues($fieldName, $field_type = 'boolean', $values = [], $contentType = 'page') {
    $this->drupalGet('admin/structure/types/manage/' . $contentType . '/fields/node.' . $contentType . '.field_' . $fieldName);

    $field_setup = $this->setupFieldByType($field_type);

    // Fill out the field form.
    $edit = [
      'default_value_input[field_' . $fieldName . ']' . $field_setup['structure'] => $field_setup['value'],
      'default_value_input[field_defaults][update_defaults]' => TRUE,
    ];

    // Run batch.
    $this->drupalPostForm(NULL, $edit, t('Save settings'));
    $this->assertNoRaw('&amp;nbsp;', 'Initial progress message is not double escaped.');
    // Now also go to the next step.
    $this->maximumMetaRefreshCount = 1;
    $this->assertRaw('<li class="messages__item">Default values were updated for 20 entities.</li>');
  }

  /**
   * Helper for field structure.
   *
   * @TODO: Add support for cardinality
   */
  protected function setupFieldByType($type) {
    switch ($type) {
      case 'string':
        // Defaults for boolean per function def.
        $structure = '[0][value]';
        $value = 'field default';
        break;

      default:
        // Defaults for boolean per function def.
        $structure = '[value]';
        $value = TRUE;
    }
    return ['structure' => $structure, 'value' => $value];
  }

}
