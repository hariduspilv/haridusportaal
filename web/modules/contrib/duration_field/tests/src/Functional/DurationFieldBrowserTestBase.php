<?php

namespace Drupal\Tests\duration_field\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Provides some helper functions for functional tests.
 */
class DurationFieldBrowserTestBase extends BrowserTestBase {

  /**
   * Asserts that a status code is what it is supposed to be.
   */
  public function assertStatusCodeEquals($statusCode) {
    $this->assertSession()->statusCodeEquals($statusCode);
  }

  /**
   * Asserts an element exists on the page.
   */
  public function assertElementExists($selector) {
    $this->assertSession()->elementExists('css', $selector);
  }

  /**
   * Asserts that an attribute exists on an element.
   */
  public function assertElementAttributeExists($selector, $attribute) {
    $this->assertSession()->elementAttributeExists('css', $selector, $attribute);
  }

  /**
   * Asserts that an attribute on an element contains the given value.
   */
  public function assertElementAttributeContains($selector, $attribute, $value) {
    $this->assertSession()->elementAttributeContains('css', $selector, $attribute, $value);
  }

  /**
   * Selects a given radio element.
   */
  public function selectRadio($htmlID) {
    if (preg_match('/^#/', $htmlID)) {
      $htmlID = substr($htmlID, 1);
    }

    $radio = $this->getSession()->getPage()->findField($htmlID);
    $name = $radio->getAttribute('name');
    $option = $radio->getAttribute('value');
    $this->getSession()->getPage()->selectFieldOption($name, $option);
  }

  /**
   * Asserts that the value of a radio element was selected.
   */
  public function assertRadioSelected($htmlID) {
    if (!preg_match('/^#/', $htmlID)) {
      $htmlID = '#' . $htmlID;
    }

    $selected_radio = $this->getSession()->getPage()->find('css', 'input[type="radio"]:checked' . $htmlID);

    if (!$selected_radio) {
      throw new \Exception('Radio button with ID ' . $htmlID . ' is not selected');
    }
  }

  /**
   * Checks the given checkbox.
   */
  public function checkCheckbox($htmlID) {
    if (preg_match('/^#/', $htmlID)) {
      $htmlID = substr($htmlID, 1);
    }

    $this->getSession()->getPage()->checkField($htmlID);
  }

  /**
   * Asserts that a checkbox was checked.
   */
  public function assertCheckboxChecked($htmlID) {
    if (preg_match('/^#/', $htmlID)) {
      $htmlID = substr($htmlID, 1);
    }

    $this->assertSession()->checkboxChecked($htmlID);
  }

  /**
   * Fills in a value on a textfield.
   */
  public function fillTextValue($htmlID, $value) {
    if (preg_match('/^#/', $htmlID)) {
      $htmlID = substr($htmlID, 1);
    }

    $this->getSession()->getPage()->fillField($htmlID, $value);
  }

  /**
   * Asserts that the value submitted in a text field is correct.
   */
  public function assertTextValue($htmlID, $value) {
    if (preg_match('/^#/', $htmlID)) {
      $htmlID = substr($htmlID, 1);
    }

    $this->assertSession()->fieldValueEquals($htmlID, $value);
  }

  /**
   * Selects an option from a select element.
   */
  public function selectSelectOption($selectElementHtmlID, $value) {
    if (preg_match('/^#/', $selectElementHtmlID)) {
      $selectElementHtmlID = substr($selectElementHtmlID, 1);
    }

    $this->getSession()->getDriver()->selectOption(
      '//select[@id="' . $selectElementHtmlID . '"]',
      $value
    );
  }

  /**
   * Asserts that an element exists by it's xpath.
   */
  public function assertElementExistsXpath($selector) {
    $this->assertSession()->elementExists('xpath', $selector);
  }

  /**
   * Gets the HTML for a page.
   */
  public function getHtml() {
    $this->assertEquals('', $this->getSession()->getPage()->getHTML());
  }

  /**
   * Asserts that the given text exists on a page.
   */
  public function assertTextExists($text) {
    $this->assertSession()->pageTextContains($text);
  }

  /**
   * Asserts that the given text does not exist on the page.
   */
  public function assertTextNotExists($text) {
    $this->assertSession()->pageTextNotContains($text);
  }

}
