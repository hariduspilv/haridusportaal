<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases\ConditionalFieldValueInterface;
use Drupal\Core\Datetime\DrupalDateTime;

/**
 * Test Conditional Fields States.
 *
 * @group conditional_fields
 */
class ConditionalFieldDateListTest extends ConditionalFieldTestBase implements ConditionalFieldValueInterface {

  /**
   * {@inheritdoc}
   */
  protected $screenshotPath = 'sites/simpletest/conditional_fields/datelist/';

  /**
   * The test's name to use in file names.
   *
   * @var string
   */
  protected $testName = 'DateList';

  /**
   * The field name used in the test.
   *
   * @var string
   */
  protected $fieldName = 'test_datelist';

  /**
   * Control field selector.
   *
   * @var array
   */
  protected $fieldSelectors;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->fieldSelectors = [
      'day' => "[name=\"{$this->fieldName}[0][value][day]\"]",
      'month' => "[name=\"{$this->fieldName}[0][value][month]\"]",
      'year' => "[name=\"{$this->fieldName}[0][value][year]\"]",
    ];
    $fieldStorageDefinition = [
      'field_name'  => $this->fieldName,
      'entity_type' => 'node',
      'type'        => 'datetime',
      'settings' => ['datetime_type' => 'date'],
    ];
    $fieldStorage = FieldStorageConfig::create($fieldStorageDefinition);
    $fieldStorage->save();

    $field = FieldConfig::create([
      'field_storage' => $fieldStorage,
      'bundle'        => 'article',
    ]);
    $field->save();

    EntityFormDisplay::load('node.article.default')
      ->setComponent($this->fieldName, [
        'type' => 'datetime_datelist',
      ])
      ->save();
  }

  /**
   * {@inheritdoc}
   */
  public function testVisibleValueWidget() {
    $date = new DrupalDateTime();
    $date->createFromTimestamp(time());
    $day = $date->format('j');
    $month = $date->format('n');
    $year = $date->format('Y');

    $this->baseTestSteps();

    // Visit a ConditionalFields configuration page for Content bundles.
    $this->createCondition('body', $this->fieldName, 'visible', 'value');
    $this->createScreenshot($this->screenshotPath . '01-' . $this->testName . __FUNCTION__ . '.png');

    // Set up conditions.
    $data = [
      '[name="condition"]' => 'value',
      '[name="values_set"]' => CONDITIONAL_FIELDS_DEPENDENCY_VALUES_WIDGET,
      $this->fieldSelectors['day'] => $day,
      $this->fieldSelectors['month'] => $month,
      $this->fieldSelectors['year'] => $year,
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
    $this->createScreenshot($this->screenshotPath . '02-' . $this->testName . __FUNCTION__ . '.png');

    // Check if that configuration is saved.
    $this->drupalGet('admin/structure/types/manage/article/conditionals');
    $this->assertSession()->statusCodeEquals(200);
    $this->createScreenshot($this->screenshotPath . '03-' . $this->testName . __FUNCTION__ . '.png');
    $this->assertSession()->pageTextContains('body ' . $this->fieldName . ' visible value');

    // Visit Article Add form to check that conditions are applied.
    $this->drupalGet('node/add/article');
    $this->assertSession()->statusCodeEquals(200);

    // Check that the field Body is not visible.
    $this->createScreenshot($this->screenshotPath . '04-' . $this->testName . __FUNCTION__ . '.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Change a date that should not show the body.
    $this->changeField($this->fieldSelectors['day'], $day);
    $this->createScreenshot($this->screenshotPath . '04-' . $this->testName . __FUNCTION__ . '.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');
    $this->changeField($this->fieldSelectors['month'], $month);
    $this->createScreenshot($this->screenshotPath . '04-' . $this->testName . __FUNCTION__ . '.png');
    $this->waitUntilHidden('.field--name-body', 50, 'Article Body field is not visible');

    // Check that the field Body is visible.
    $this->changeField($this->fieldSelectors['year'], $year);
    $this->createScreenshot($this->screenshotPath . '04-' . $this->testName . __FUNCTION__ . '.png');
    $this->waitUntilVisible('.field--name-body', 50, 'Article Body field is visible');

    // Change a date that should not show the body again.
    $this->changeField($this->fieldSelectors['day'], $day + 1);
    $this->createScreenshot($this->screenshotPath . '06-' . $this->testName . __FUNCTION__ . '.png');
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

}
