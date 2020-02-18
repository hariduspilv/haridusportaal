<?php

namespace Drupal\Tests\maxlength\FunctionalJavascript;

use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\entity_test\Entity\EntityTest;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\FunctionalJavascriptTests\WebDriverTestBase;

/**
 * Tests Javascript behaviour of Maxlength module.
 *
 * @group maxlength
 */
class MaxlengthJavascriptTest extends WebDriverTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['entity_test', 'maxlength'];

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'classy';

  /**
   * Tests that a single maxlength message is displayed to a formatted textarea.
   */
  public function testMaxlengthIsUnique() {
    FieldStorageConfig::create([
      'type' => 'text_long',
      'entity_type' => 'entity_test',
      'field_name' => 'foo',
    ])->save();
    FieldConfig::create([
      'entity_type' => 'entity_test',
      'bundle' => 'entity_test',
      'field_name' => 'foo',
      'label' => 'Foo',
      'description' => 'Description of a text field',
    ])->save();
    $widget = [
      'type' => 'text_textarea',
      'third_party_settings' => [
        'maxlength' => ['maxlength_js' => 200],
      ],
    ];
    EntityFormDisplay::load('entity_test.entity_test.default')
      ->setComponent('foo', $widget)
      ->save();

    $entity = EntityTest::create(['type' => 'entity_test', 'name' => 'Test']);
    $entity->save();

    $this->drupalLogin($this->drupalCreateUser(['administer entity_test content']));
    $this->drupalGet($entity->toUrl('edit-form'));

    // Give maxlength.js some time to manipulate the DOM.
    $this->getSession()->wait(1000, 'jQuery("div.counter").is(":visible")');

    // Check that only a counter div is found on the page.
    $this->assertSession()->elementsCount('css', 'div.counter', 1);

    // Check that the counter div follows the description of the field.
    $found = $this->xpath('//div[@data-drupal-selector="edit-foo-0"]/following-sibling::div[@id="edit-foo-0-value-counter"]');
    $this->assertCount(1, $found);
  }

}
