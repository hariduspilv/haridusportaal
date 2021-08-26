<?php

namespace Drupal\field_defaults\Tests;

/**
 * Tests that defaults are set on string fields.
 *
 * @group field_defaults
 */
class StringTest extends FieldDefaultsTestBase {

  /**
   * Test updating a boolean.
   */
  public function testFieldString() {
    $fieldName = $this->createField('string');
    $this->setDefaultValues($fieldName, 'string');

    // Ensure value is checked on any random node.
    $this->drupalGet('node/' . rand(1, 20) . '/edit');

    $field_setup = $this->setupFieldByType('string');
    $this->assertFieldByName('field_' . $fieldName . $field_setup['structure'], $field_setup['value']);
  }

}
