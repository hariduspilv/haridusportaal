<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases;

/**
 * Interface ConditionalFieldCheckedUncheckedInterface
 * @package Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases
 */
interface ConditionalFieldCheckedUncheckedInterface {

  /**
   * The target field is Visible when the control field is Checked.
   */
  public function testVisibleChecked();

  /**
   * The target field is Visible when the control field is Unchecked.
   */
  public function testVisibleUnchecked();

  /**
   * The target field is Invisible when the control field is Unchecked.
   */
  public function testInvisibleUnchecked();

}
