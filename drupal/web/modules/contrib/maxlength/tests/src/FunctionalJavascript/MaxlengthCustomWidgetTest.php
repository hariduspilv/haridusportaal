<?php

namespace Drupal\Tests\maxlength\FunctionalJavascript;

use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\FunctionalJavascriptTests\WebDriverTestBase;

/**
 * Tests the custom widget support.
 *
 * @group maxlength
 */
class MaxlengthCustomWidgetTest extends WebDriverTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'node',
    'field',
    'field_ui',
    'maxlength',
    'maxlength_custom_widget_test',
  ];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'classy';

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->drupalCreateContentType(['type' => 'article', 'name' => 'Article']);

    EntityFormDisplay::load('node.article.default')
      ->setComponent('body', [
        'type' => 'text_textarea_custom_widget',
        'third_party_settings' => [
          'maxlength' => ['maxlength_js' => 200],
        ],
      ])
      ->save();
  }

  /**
   * Tests that a custom textarea widget gets picked up and is supported.
   */
  public function testMaxlengthCustomWidgetSupported() {

    $admin_user = $this->drupalCreateUser([
      'bypass node access',
      'administer nodes',
      'administer node form display',
    ]);
    $this->drupalLogin($admin_user);

    $this->drupalGet('admin/structure/types/manage/article/form-display');
    $page = $this->getSession()->getPage();
    $page->pressButton('edit-fields-body-settings-edit');
    $this->getSession()->wait(1000);
    $this->assertSession()->elementsCount('css', '[data-drupal-selector="edit-fields-body-settings-edit-form-third-party-settings-maxlength-maxlength-js-summary"]', 1);
    $page->findField('Summary max length')->setValue("123");
    $page->pressButton('Save');
    $this->assertSession()->responseContains('Max summary length: 123');

    $this->drupalGet('node/add/article');

    // Give maxlength.js some time to manipulate the DOM.
    $this->getSession()->wait(1000, 'jQuery("div.counter").is(":visible")');

    // Check each counter for summary and body.
    $this->assertSession()->elementsCount('css', 'div.counter', 2);

    // Check that the counter div follows the description of the field.
    $found = $this->xpath('//textarea[@data-drupal-selector="edit-body-0-value"]/following-sibling::div[@id="edit-body-0-value-counter"]');
    $this->assertCount(1, $found);
  }

}
