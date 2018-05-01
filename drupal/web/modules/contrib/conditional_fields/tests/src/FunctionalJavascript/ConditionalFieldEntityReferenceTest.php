<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript;

use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\field\Tests\EntityReference\EntityReferenceTestTrait;
use Drupal\node\Entity\Node;
use Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases\ConditionalFieldFilledEmptyInterface;
use Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases\ConditionalFieldValueInterface;
use Drupal\Tests\RandomGeneratorTrait;

/**
 * Test Conditional Fields Entity Reference Plugin.
 *
 * @group conditional_fields
 */
class ConditionalFieldEntityReferenceTest extends ConditionalFieldTestBase implements
  ConditionalFieldValueInterface,
  ConditionalFieldFilledEmptyInterface {

  use EntityReferenceTestTrait;
  use RandomGeneratorTrait;

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'conditional_fields',
    'node',
  ];

  /**
   * {@inheritdoc}
   */
  protected $screenshotPath = 'sites/simpletest/conditional_fields/entity_reference/';

  /**
   * The field name used in the test.
   *
   * @var string
   */
  protected $fieldName = 'entity_reference';

  /**
   * Jquery selector of field in a document.
   *
   * @var string
   */
  protected $fieldSelector;

  /**
   * The field storage definition used to created the field storage.
   *
   * @var array
   */
  protected $fieldStorageDefinition;

  /**
   * The list field storage used in the test.
   *
   * @var \Drupal\field\Entity\FieldStorageConfig
   */
  protected $fieldStorage;

  /**
   * The field to use in this test.
   *
   * @var \Drupal\field\Entity\FieldConfig
   */
  protected $field;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->fieldSelector = '[name="field_' . $this->fieldName . '[0][target_id]"]';

    $handler_settings = [
      'target_bundles' => [
        'article' => 'article',
      ],
    ];
    $this->createEntityReferenceField('node', 'article', 'field_' . $this->fieldName, $this->fieldName, 'node', 'default', $handler_settings, -1);

    EntityFormDisplay::load('node.article.default')
      ->setComponent('field_' . $this->fieldName, ['type' => 'entity_reference_autocomplete'])
      ->save();
  }

  /**
   * Tests creating Conditional Field: Visible if has value from widget.
   */
  public function testVisibleValueWidget() {
    $this->baseTestSteps();

    // Create a node that we will use in reference field.
    $node = Node::create([
      'type' => 'article',
      'title' => 'Referenced node'
    ]);
    $node->save();

    $referenced_format_1 = sprintf("%s (%d)", $node->label(), $node->id());
    $referenced_format_2 = sprintf("%s", $node->label());
    $referenced_format_wrong = sprintf("%s ", $node->label());

    // Visit a ConditionalFields configuration page for Content bundles.
    $this->createCondition('body', 'field_' . $this->fieldName, 'visible', 'value');
    $this->createScreenshot($this->screenshotPath . '01-entity-reference-add-filed-conditions.png');

    // Set up conditions.
    $data = [
      '[name="condition"]' => 'value',
      '[name="values_set"]' => CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET,
      $this->fieldSelector => $referenced_format_1,
      '[name="grouping"]' => 'AND',
      '[name="state"]' => 'visible',
      '[name="effect"]' => 'show',
    ];
    foreach ($data as $selector => $value) {
      $this->changeField($selector, $value);
    }

    $this->getSession()->wait(1000, '!jQuery.active');
    $this->getSession()->executeScript("jQuery('#conditional-field-edit-form').submit();");
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '02-entity-reference-post-add-list-options-filed-conditions.png');

    // Check if that configuration is saved.
    $this->drupalGet('admin/structure/types/manage/article/conditionals');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '03-entity-reference-submit-entity-reference-filed-conditions.png');
    $this->assertSession()->pageTextContains('body field_' . $this->fieldName . ' visible value');

    // Visit Article Add form to check that conditions are applied.
    $this->drupalGet('node/add/article');
    $this->assertSession()->statusCodeEquals(200);

    // Check that the field Body is not visible.
    $this->createScreenshot($this->screenshotPath . '04-entity-reference-body-invisible-when-controlled-field-has-no-value.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change an entity reference field that should not show the body.
    $this->changeField($this->fieldSelector, $this->randomMachineName());
    $this->createScreenshot($this->screenshotPath . '05-entity-reference-body-invisible-when-controlled-field-has-wrong-value.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change an entity reference field in format 'Node title (nid)' to show the body.
    $this->changeField($this->fieldSelector, $referenced_format_1);
    $this->createScreenshot($this->screenshotPath . '06-entity-reference-body-visible-when-controlled-field-has-value-format-1.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Set wrong format for an entity reference field to hide the body.
    $this->changeField($this->fieldSelector, $referenced_format_wrong);
    $this->createScreenshot($this->screenshotPath . '07-entity-reference-body-invisible-when-controlled-field-has-value-in-wrong-format.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change an entity reference field in format 'Node title' to show the body.
    $this->changeField($this->fieldSelector, $referenced_format_2);
    $this->createScreenshot($this->screenshotPath . '08-entity-reference-body-visible-when-controlled-field-has-value-format-2.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Set an empty value to hide body.
    $this->changeField($this->fieldSelector, '');
    $this->createScreenshot($this->screenshotPath . '09-entity-reference-body-invisible-when-controlled-field-has-no-value-again.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueRegExp() {
    // TODO: Implement testVisibleValueRegExp() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueAnd() {
    // TODO: Implement testVisibleValueAnd() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueOr() {
    // TODO: Implement testVisibleValueOr() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueNot() {
    // TODO: Implement testVisibleValueNot() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueXor() {
    // TODO: Implement testVisibleValueXor() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleFilled() {
    // TODO: Implement testVisibleFilled() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleEmpty() {
    // TODO: Implement testVisibleEmpty() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testInvisibleFilled() {
    // TODO: Implement testInvisibleFilled() method.
    $this->markTestIncomplete();
  }

  /**
   * {@inheritdoc}
   */
  public function testInvisibleEmpty() {
    // TODO: Implement testInvisibleEmpty() method.
    $this->markTestIncomplete();
  }

}
