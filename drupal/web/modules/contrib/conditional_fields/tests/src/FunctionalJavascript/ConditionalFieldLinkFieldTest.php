<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript;

use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\link\LinkItemInterface;
use Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases\ConditionalFieldFilledEmptyInterface;
use Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases\ConditionalFieldValueInterface;

/**
 * Test Conditional Fields Link field plugin.
 *
 * @group conditional_fields
 */
class ConditionalFieldLinkFieldTest extends ConditionalFieldTestBase implements
  ConditionalFieldValueInterface,
  ConditionalFieldFilledEmptyInterface {

  /**
   * {@inheritdoc}
   */
  protected $screenshotPath = 'sites/simpletest/conditional_fields/link_field/';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'conditional_fields',
    'node',
    'link',
  ];

  /**
   * The field name used in the test.
   *
   * @var string
   */
  protected $fieldName = 'link_field';

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

    $this->fieldSelector = '[name="' . $this->fieldName . '[0][uri]"]';
    $this->fieldStorageDefinition = [
      'field_name' => $this->fieldName,
      'entity_type' => 'node',
      'type' => 'link',
    ];
    $this->fieldStorage = FieldStorageConfig::create($this->fieldStorageDefinition);
    $this->fieldStorage->save();

    $this->field = FieldConfig::create([
      'field_storage' => $this->fieldStorage,
      'bundle' => 'article',
      'settings' => [
        'title' => DRUPAL_DISABLED,
        'link_type' => LinkItemInterface::LINK_GENERIC,
      ],
    ]);
    $this->field->save();

    EntityFormDisplay::load('node.article.default')
      ->setComponent($this->fieldName, [
        'type' => 'link_default',
      ])
      ->save();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueWidget() {
    $this->baseTestSteps();

    // Visit a ConditionalFields configuration page for Content bundles.
    $this->createCondition('body', $this->fieldName, 'visible', 'value');
    $this->createScreenshot($this->screenshotPath . '01-testFieldLinkVisibleValueWidget.png');

    // Set up conditions.
    $external_url = 'https://drupal.org';
    $data = [
      '[name="condition"]' => 'value',
      '[name="values_set"]' => CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET,
      $this->fieldSelector => $external_url,
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
    $this->createScreenshot($this->screenshotPath . '02-testFieldLinkVisibleValueWidget.png');

    // Check if that configuration is saved.
    $this->drupalGet('admin/structure/types/manage/article/conditionals');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '03-testFieldLinkVisibleValueWidget.png');
    $this->assertSession()->pageTextContains('body ' . $this->fieldName . ' visible value');

    // Visit Article Add form to check that conditions are applied.
    $this->drupalGet('node/add/article');
    $this->assertSession()->statusCodeEquals(200);

    // Change a link that should not show the body.
    $this->changeField($this->fieldSelector, '');
    $this->createScreenshot($this->screenshotPath . '04-testFieldLinkVisibleValueWidget.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Check that the field Body is visible.
    $this->changeField($this->fieldSelector, $external_url);
    $this->createScreenshot($this->screenshotPath . '05-testFieldLinkVisibleValueWidget.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Change a link that should not show the body again.
    $this->changeField($this->fieldSelector, '');
    $this->createScreenshot($this->screenshotPath . '06-testFieldLinkVisibleValueWidget.png');
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
    $this->baseTestSteps();

    // Visit a ConditionalFields configuration page for Content bundles.
    $this->createCondition('body', $this->fieldName, 'visible', 'value');
    $this->createScreenshot($this->screenshotPath . '01-link-field-add-filed-conditions.png');

    // Set up conditions.
    $urls = ['node/add', 'node/1'];
    $data = [
      '[name="condition"]' => 'value',
      '[name="values_set"]' => CONDITIONAL_FIELDS_DEPENDENCY_VALUES_OR,
      '[name="values"]' => implode('\n', $urls),
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
    $this->createScreenshot($this->screenshotPath . '02-link-field-post-add-list-options-filed-conditions.png');

    // Check if that configuration is saved.
    $this->drupalGet('admin/structure/types/manage/article/conditionals');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '03-link-field-submit-options-filed-conditions.png');
    $this->assertSession()->pageTextContains('body ' . $this->fieldName . ' visible value');

    // Visit Article Add form to check that conditions are applied.
    $this->drupalGet('node/add/article');
    $this->assertSession()->statusCodeEquals(200);

    // Check that the field Body is not visible.
    $this->createScreenshot($this->screenshotPath . '04-link-field-body-invisible-when-controlled-field-has-no-value.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change a link that should not show the body.
    $this->changeField($this->fieldSelector, 'https://drupal.org');
    $this->createScreenshot($this->screenshotPath . '05-link-field-body-invisible-when-controlled-field-has-wrong-value.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change a link value to show the body.
    $this->changeField($this->fieldSelector, $urls[0]);
    $this->createScreenshot($this->screenshotPath . '06-link-field-body-visible-when-controlled-field-has-value.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Change a link value to show the body.
    $this->changeField($this->fieldSelector, $urls[1]);
    $this->createScreenshot($this->screenshotPath . '07-link-field-body-visible-when-controlled-field-has-value.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Change a link value to hide the body again.
    $this->changeField($this->fieldSelector, '');
    $this->createScreenshot($this->screenshotPath . '08-link-field-body-invisible-when-controlled-field-has-no-value-again.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueNot() {
    $this->baseTestSteps();

    // Visit a ConditionalFields configuration page for Content bundles.
    $this->createCondition('body', $this->fieldName, 'visible', 'value');
    $this->createScreenshot($this->screenshotPath . '01-testFieldLinkVisibleValueNot.png');

    // Set up conditions.
    $urls = ['node/add', 'node/1'];
    $data = [
      '[name="condition"]' => 'value',
      '[name="values_set"]' => CONDITIONAL_FIELDS_DEPENDENCY_VALUES_NOT,
      '[name="values"]' => implode('\n', $urls),
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
    $this->createScreenshot($this->screenshotPath . '02-testFieldLinkVisibleValueNot.png');

    // Check if that configuration is saved.
    $this->drupalGet('admin/structure/types/manage/article/conditionals');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '03-testFieldLinkVisibleValueNot.png');
    $this->assertSession()->pageTextContains('body ' . $this->fieldName . ' visible value');

    // Visit Article Add form to check that conditions are applied.
    $this->drupalGet('node/add/article');
    $this->assertSession()->statusCodeEquals(200);

    // Check that the field Body is visible.
    $this->createScreenshot($this->screenshotPath . '04-testFieldLinkVisibleValueNot.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Change a link that should not show the body.
    $this->changeField($this->fieldSelector, $urls[0]);
    $this->createScreenshot($this->screenshotPath . '05-testFieldLinkVisibleValueNot.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change a link that should not show the body again.
    $this->changeField($this->fieldSelector, $urls[1]);
    $this->createScreenshot($this->screenshotPath . '06-testFieldLinkVisibleValueNot.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change a link value to show the body.
    $this->changeField($this->fieldSelector, '');
    $this->createScreenshot($this->screenshotPath . '08-testFieldLinkVisibleValueNot.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');
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
