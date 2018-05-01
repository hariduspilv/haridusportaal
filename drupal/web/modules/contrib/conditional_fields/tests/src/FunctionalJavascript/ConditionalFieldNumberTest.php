<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript;

use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases\ConditionalFieldValueInterface;
use Drupal\Tests\RandomGeneratorTrait;

/**
 * Test Conditional Fields Number Plugin.
 *
 * @group conditional_fields
 */
class ConditionalFieldNumberTest extends ConditionalFieldTestBase implements ConditionalFieldValueInterface {

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
  protected $screenshotPath = 'sites/simpletest/conditional_fields/number_integer/';

  /**
   * The field name used in the test.
   *
   * @var string
   */
  protected $fieldName = 'number_integer';

  /**
   * Jquery selector of field in a document.
   *
   * @var string
   */
  protected $fieldSelector;

  /**
   * The value that trigger dependency.
   *
   * @var string
   */
  protected $validValue = '2017';

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->fieldSelector = '[name="field_' . $this->fieldName . '[0][value]"]';

    FieldStorageConfig::create([
      'field_name' => 'field_' . $this->fieldName,
      'entity_type' => 'node',
      'type' => 'integer',
      'cardinality' => 1,
    ])->save();

    FieldConfig::create([
      'field_name' => 'field_' . $this->fieldName,
      'entity_type' => 'node',
      'bundle' => 'article',
      'settings' => [
        'min' => '',
        'max' => '',
        'prefix' => '',
      ]
    ])->save();

    EntityFormDisplay::load('node.article.default')
      ->setComponent('field_' . $this->fieldName, [
        'type' => 'number',
        'settings' => [
          'prefix_suffix' => FALSE,
        ],
      ])
      ->save();
  }

  /**
   * Tests creating Conditional Field: Visible if has value from widget.
   */
  public function testVisibleValueWidget() {
    $this->baseTestSteps();

    // Visit a ConditionalFields configuration page for Content bundles.
    $this->createCondition('body', 'field_' . $this->fieldName, 'visible', 'value');
    $this->createScreenshot($this->screenshotPath . '01-testNumberInteger-testVisibleValueWidget.png');

    // Set up conditions.
    $data = [
      '[name="condition"]' => 'value',
      '[name="values_set"]' => CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET,
      $this->fieldSelector => $this->validValue,
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
    $this->createScreenshot($this->screenshotPath . '02-testNumberInteger-testVisibleValueWidget.png');

    // Check if that configuration is saved.
    $this->drupalGet('admin/structure/types/manage/article/conditionals');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '03-testNumberInteger-testVisibleValueWidget.png');
    $this->assertSession()->pageTextContains('body field_' . $this->fieldName . ' visible value');

    // Visit Article Add form to check that conditions are applied.
    $this->drupalGet('node/add/article');
    $this->assertSession()->statusCodeEquals(200);

    // Check that the field Body is not visible.
    $this->createScreenshot($this->screenshotPath . '04-testNumberInteger-testVisibleValueWidget.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change the number field that should not show the body.
    $this->changeField($this->fieldSelector, mt_rand(10, 100));
    $this->createScreenshot($this->screenshotPath . '05-testNumberInteger-testVisibleValueWidget.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change the number field to show the body.
    $this->changeField($this->fieldSelector, $this->validValue);
    $this->createScreenshot($this->screenshotPath . '06-testNumberInteger-testVisibleValueWidget.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Set wrong value for number field to hide the body.
    $this->changeField($this->fieldSelector, mt_rand(10, 100));
    $this->createScreenshot($this->screenshotPath . '07-testNumberInteger-testVisibleValueWidget.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Set an empty value to hide body.
    $this->changeField($this->fieldSelector, '');
    $this->createScreenshot($this->screenshotPath . '08-testNumberInteger-testVisibleValueWidget.png');
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
