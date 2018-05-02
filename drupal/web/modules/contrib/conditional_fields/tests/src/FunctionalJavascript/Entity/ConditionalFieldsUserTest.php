<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript\Entity;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\Tests\conditional_fields\FunctionalJavascript\ConditionalFieldTestBase;
use Drupal\Core\Entity\Entity\EntityFormDisplay;

/**
 * Test Conditional Fields check User entity.
 *
 * @group conditional_fields
 */
class ConditionalFieldsUserTestTest extends ConditionalFieldTestBase {

  /**
   * Control field name.
   *
   * @var string
   */
  protected $dependee = 'field_dependee';

  /**
   * Target field name.
   *
   * @var string
   */
  protected $dependent = 'field_dependent';

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'conditional_fields',
    'field_ui',
  ];

  /**
   * {@inheritdoc}
   */
  protected $screenshotPath = 'sites/simpletest/conditional_fields/user/';

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();
    $this->addField($this->dependee, 'boolean', 'boolean_checkbox');
    $this->addField($this->dependent, 'text', 'text_textfield');
  }

  /**
   * Add field to User CT.
   *
   * @param string $field_name
   *   Field name to create.
   * @param string $type
   *   Field type.
   * @param string $widget
   *   Field Widget to use.
   */
  protected function addField($field_name, $type, $widget) {
    $fieldStorageDefinition = [
      'field_name' => $field_name,
      'entity_type' => 'user',
      'type' => $type,
      'cardinality' => -1,
    ];
    $fieldStorage = FieldStorageConfig::create($fieldStorageDefinition);
    $fieldStorage->save();

    $field = FieldConfig::create([
      'field_storage' => $fieldStorage,
      'bundle' => 'user',
    ]);
    $field->save();
    entity_get_form_display('user', 'user', 'default')
      ->setComponent($field_name, [
        'type' => $widget,
      ])
      ->save();
  }

  /**
   * Test CF for User CT.
   */
  public function testUserEntity() {
    $this->baseTestSteps();
    $this->createCondition($this->dependent, $this->dependee, 'visible', 'checked');

    // Check that configuration is saved.
    $this->drupalGet('admin/structure/conditional_fields/user/user');
    $this->createScreenshot($this->screenshotPath . '01-config-was-added.png');
    $this->assertSession()->pageTextContains($this->dependent . ' ' . $this->dependee . ' visible checked');

    // Visit user register form to check that conditions are applied.
    $this->drupalGet('admin/people/create');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '02-mail-not-visible.png');
    $this->waitUntilHidden('.field--name-field-dependent', 50, 'Dependent field is not visible');
    $this->changeSelect('#edit-field-dependee-value', TRUE);
    $this->createScreenshot($this->screenshotPath . '03-mail-visible.png');
    $this->waitUntilVisible('.field--name-field-dependent', 50, 'Dependent field is visible');
  }

  /**
   * {@inheritdoc}
   */
  protected function baseTestSteps() {
    $user = $this->drupalCreateUser([
      'administer users',
      'administer account settings',
      'view conditional fields',
      'edit conditional fields',
      'delete conditional fields',
    ]);
    $this->drupalLogin($user);

    // Visit a ConditionalFields configuration page that requires login.
    $this->drupalGet('admin/structure/conditional_fields');
    $this->assertSession()->statusCodeEquals(200);

    // Configuration page contains the `User` entity type.
    $this->assertSession()->pageTextContains('User');

    // Visit a ConditionalFields configuration page for User bundles.
    $this->drupalGet('admin/structure/conditional_fields/user');
    $this->assertSession()->statusCodeEquals(200);

    // Visit a ConditionalFields configuration page for User.
    $this->drupalGet('admin/structure/conditional_fields/user/user');
    $this->assertSession()->statusCodeEquals(200);
  }

}
