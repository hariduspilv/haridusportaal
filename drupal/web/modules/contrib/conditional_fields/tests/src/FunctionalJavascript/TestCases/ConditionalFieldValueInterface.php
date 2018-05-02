<?php

namespace Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases;

/**
 * Interface ConditionalFieldValueInterface
 * @package Drupal\Tests\conditional_fields\FunctionalJavascript\TestCases
 */
interface ConditionalFieldValueInterface {

  /**
   * The target field is Visible when the control field has value from Widget.
   */
  public function testVisibleValueWidget();

  /**
   * The target field is Visible when the control field has value from Regular expression.
   */
  public function testVisibleValueRegExp();

  /**
   * The target field is Visible when the control field has value with AND condition.
   */
  public function testVisibleValueAnd();

  /**
   * The target field is Visible when the control field has value with OR condition.
   */
  public function testVisibleValueOr();

  /**
   * The target field is Visible when the control field has value with NOT condition.
   */
  public function testVisibleValueNot();

  /**
   * The target field is Visible when the control field has value with XOR condition.
   */
  public function testVisibleValueXor();

}
