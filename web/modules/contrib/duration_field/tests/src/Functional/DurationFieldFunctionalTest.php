<?php

namespace Drupal\Tests\duration_field\Functional;

/**
 * Functional tests for the Duration Field module.
 *
 * @group duration_field
 */
class DurationFieldAccessTest extends DurationFieldBrowserTestBase {

  protected $adminUser;

  protected $contentType;

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = ['field', 'field_ui', 'duration_field', 'node'];

  /**
   * Tests human readable values.
   */
  public function testHumanReadableAll() {
    $this->createDefaultSetup();
    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-year', 1);
    $this->fillTextValue('#edit-field-duration-0-value-month', 2);
    $this->fillTextValue('#edit-field-duration-0-value-day', 3);
    $this->fillTextValue('#edit-field-duration-0-value-hour', 4);
    $this->fillTextValue('#edit-field-duration-0-value-minute', 5);
    $this->fillTextValue('#edit-field-duration-0-value-second', 6);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1 year 2 months 3 days 4 hours 5 minutes 6 seconds');

    $this->setHumanReadableOptions('short');
    $this->drupalGet('/node/1');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1 yr 2 mo 3 days 4 hr 5 min 6 s');

    $this->setHumanReadableOptions('full', 'hyphen');
    $this->drupalGet('/node/1');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1 year - 2 months - 3 days - 4 hours - 5 minutes - 6 seconds');

    $this->setHumanReadableOptions('full', 'comma');
    $this->drupalGet('/node/1');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1 year, 2 months, 3 days, 4 hours, 5 minutes, 6 seconds');

    $this->setHumanReadableOptions('full', 'newline');
    $this->drupalGet('/node/1');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1 year2 months3 days4 hours5 minutes6 seconds');
  }

  /**
   * Test human readable times.
   */
  public function testHumanReadableTime() {
    $this->createDefaultSetup(['hour', 'minute', 'second']);

    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-hour', 1);
    $this->fillTextValue('#edit-field-duration-0-value-minute', 2);
    $this->fillTextValue('#edit-field-duration-0-value-second', 3);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1 hour 2 minutes 3 seconds');
    $this->assertTextNotExists('year');

  }

  /**
   * Tests human readable dates.
   */
  public function testHumanReadableDate() {

    $this->createDefaultSetup(['year', 'month', 'day']);

    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-year', 6);
    $this->fillTextValue('#edit-field-duration-0-value-month', 5);
    $this->fillTextValue('#edit-field-duration-0-value-day', 4);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('6 years 5 months 4 days');
    $this->assertTextNotExists('minute');
  }

  /**
   * Tests raw values.
   */
  public function testRawValue() {

    $this->createDefaultSetup();
    $this->setFormatter('raw');

    $this->drupalGet('node/add/test_type');
    $this->assertStatusCodeEquals(200);
    $this->assertSession()->addressMatches('/^\/node\/add\/test_type$/');
    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-year', 1);
    $this->fillTextValue('#edit-field-duration-0-value-month', 2);
    $this->fillTextValue('#edit-field-duration-0-value-day', 3);
    $this->fillTextValue('#edit-field-duration-0-value-hour', 4);
    $this->fillTextValue('#edit-field-duration-0-value-minute', 5);
    $this->fillTextValue('#edit-field-duration-0-value-second', 6);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('P1Y2M3DT4H5M6S');
  }

  /**
   * Tests full time output.
   */
  public function testTimeFull() {

    $this->createDefaultSetup();
    $this->setFormatter('time');

    $this->drupalGet('node/add/test_type');
    $this->assertStatusCodeEquals(200);
    $this->assertSession()->addressMatches('/^\/node\/add\/test_type$/');
    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-year', 1);
    $this->fillTextValue('#edit-field-duration-0-value-month', 2);
    $this->fillTextValue('#edit-field-duration-0-value-day', 3);
    $this->fillTextValue('#edit-field-duration-0-value-hour', 4);
    $this->fillTextValue('#edit-field-duration-0-value-minute', 5);
    $this->fillTextValue('#edit-field-duration-0-value-second', 6);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1-2-3 4:05:06');
  }

  /**
   * Tests the date part of a time.
   */
  public function testTimeDate() {

    $this->createDefaultSetup(['year', 'month', 'day']);
    $this->setFormatter('time');

    $this->drupalGet('node/add/test_type');
    $this->assertStatusCodeEquals(200);
    $this->assertSession()->addressMatches('/^\/node\/add\/test_type$/');
    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-year', 1);
    $this->fillTextValue('#edit-field-duration-0-value-month', 2);
    $this->fillTextValue('#edit-field-duration-0-value-day', 3);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('1-2-3');
  }

  /**
   * Tests the time part of a time.
   */
  public function testTimeTime() {

    $this->createDefaultSetup(['hour', 'minute', 'second']);
    $this->setFormatter('time');

    $this->drupalGet('node/add/test_type');
    $this->assertStatusCodeEquals(200);
    $this->assertSession()->addressMatches('/^\/node\/add\/test_type$/');
    $this->fillTextValue('#edit-title-0-value', 'Dummy Title');
    $this->fillTextValue('#edit-field-duration-0-value-hour', 4);
    $this->fillTextValue('#edit-field-duration-0-value-minute', 5);
    $this->fillTextValue('#edit-field-duration-0-value-second', 6);
    $this->click('input[name="op"]');
    $this->assertStatusCodeEquals(200);
    $this->assertTextExists('4:05:06');
  }

  /**
   * Sets up a date.
   */
  protected function createDefaultSetup($granularity = ['year', 'month', 'day', 'hour', 'minute', 'second']) {

    $this->adminUser = $this->createUser([], 'Admin User', TRUE);
    $admin_role = $this->createAdminRole();
    $this->adminUser->addRole($admin_role);
    $this->drupalLogin($this->adminUser);
    $this->contentType = $this->createContentType(['type' => 'test_type', 'name' => 'Test Type']);
    $this->drupalGet('admin/structure/types/manage/test_type/fields/add-field');
    $this->assertStatusCodeEquals(200);
    $this->selectSelectOption('#edit-new-storage-type', 'duration');
    $this->fillTextValue('#edit-label', 'Duration');
    $this->fillTextValue('#edit-field-name', 'duration');
    $this->click('#edit-submit');
    $this->assertSession()->addressMatches('/^\/admin\/structure\/types\/manage\/test_type\/fields\/node.test_type.field_duration\/storage$/');
    $this->assertStatusCodeEquals(200);
    $this->click('#edit-submit');
    $this->assertSession()->addressMatches('/^\/admin\/structure\/types\/manage\/test_type\/fields\/node.test_type.field_duration$/');
    $this->assertStatusCodeEquals(200);
    $check = array_diff(['year', 'month', 'day', 'hour', 'minute', 'second'], $granularity);
    foreach ($check as $field) {
      $this->checkCheckbox('#edit-settings-granularity-' . $field);
    }

    foreach ($granularity as $field) {
      $this->assertCheckboxChecked('#edit-settings-granularity-' . $field);
    }
    $this->click('#edit-submit');
    $this->assertSession()->addressMatches('/^\/admin\/structure\/types\/manage\/test_type\/fields$/');
    $this->assertStatusCodeEquals(200);
    $this->assertElementExistsXpath('//table[@id="field-overview"]//td[text()="Duration"]');
    $this->drupalGet('node/add/test_type');
    $this->assertStatusCodeEquals(200);
    $this->assertSession()->addressMatches('/^\/node\/add\/test_type$/');
    foreach ($granularity as $field) {
      $this->assertElementExists('input#edit-field-duration-0-value-' . $field . '[type="number"]');
    }
  }

  /**
   * Sets some human readable options.
   */
  protected function setHumanReadableOptions($text_length = 'full', $separator = 'space') {
    $this->drupalGet('/admin/structure/types/manage/test_type/display');
    $this->assertStatusCodeEquals(200);
    $this->click('#edit-fields-field-duration-settings-edit');
    $this->assertStatusCodeEquals(200);
    $this->selectSelectOption('#edit-fields-field-duration-settings-edit-form-settings-text-length', $text_length);
    $this->selectSelectOption('#edit-fields-field-duration-settings-edit-form-settings-separator', $separator);
    $this->click('#edit-fields-field-duration-settings-edit-form-actions-save-settings');
    $this->assertStatusCodeEquals(200);
    $this->click('#edit-submit');
    $this->assertStatusCodeEquals(200);
  }

  /**
   * Sets the formatter to be tested.
   */
  protected function setFormatter($formatter) {

    $types = [
      'human' => 'duration_human_display',
      'time' => 'duration_time_display',
      'raw' => 'duration_raw_value_display',
    ];

    $this->drupalGet('/admin/structure/types/manage/test_type/display');
    $this->assertStatusCodeEquals(200);
    $this->selectSelectOption('#edit-fields-field-duration-type', $types[$formatter]);
    $this->click('#edit-submit');
  }

}
