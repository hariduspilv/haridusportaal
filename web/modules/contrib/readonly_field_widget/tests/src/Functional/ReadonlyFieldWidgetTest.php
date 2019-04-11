<?php

namespace Drupal\Tests\readonly_field_widget\Functional;

use Drupal\taxonomy\Entity\Term;
use Drupal\taxonomy\Entity\Vocabulary;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests Readonly Field Widget basic behaviour.
 *
 * @group readonly_field_widget
 */
class ReadonlyFieldWidgetTest extends BrowserTestBase {


  /**
   * {@inheritdoc}
   */
  public static $modules = ['readonly_field_widget_test'];

  /**
   * {@inheritdoc}
   */
  protected $strictConfigSchema = FALSE;

  protected $admin;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->createContentType(['name' => 'page', 'type' => 'page']);
    $this->createContentType(['name' => 'article', 'type' => 'article']);

    $tags_vocab = Vocabulary::create(['vid' => 'tags', 'title' => 'Tags']);
    $tags_vocab->save();

    $this->admin = $this->createUser([], NULL, TRUE);
    $this->drupalLogin($this->admin);

    // Add an article reference field.
    $this->drupalGet('/admin/structure/types/manage/page/fields/add-field');
    $this->submitForm([
      'new_storage_type' => 'field_ui:entity_reference:node',
      'label' => 'article reference',
      'field_name' => 'article_reference',
    ], 'Save and continue');
    $this->submitForm([], 'Save field settings');
    $this->submitForm(['settings[handler_settings][target_bundles][article]' => 'article'], 'Save settings');
    $this->drupalGet('/admin/structure/types/manage/page/form-display');
    $this->submitForm([
      'fields[field_article_reference][type]' => 'readonly_field_widget',
    ], 'Save');
    $this->submitForm([], 'field_article_reference_settings_edit');
    $this->submitForm([
      'fields[field_article_reference][settings_edit_form][settings][label]' => 'above',
      'fields[field_article_reference][settings_edit_form][settings][formatter_type]' => 'entity_reference_entity_view',
      'fields[field_article_reference][settings_edit_form][settings][show_description]' => TRUE,
      'fields[field_article_reference][settings_edit_form][settings][formatter_settings][entity_reference_entity_view][view_mode]' => 'default',
    ], 'Update');
    $this->submitForm([], 'Save');

    // Add a taxonomy term reference field.
    $this->drupalGet('/admin/structure/types/manage/page/fields/add-field');
    $this->submitForm([
      'new_storage_type' => 'field_ui:entity_reference:taxonomy_term',
      'label' => 'term reference',
      'field_name' => 'term_reference',
    ], 'Save and continue');
    $this->submitForm([], 'Save field settings');
    $this->submitForm(['settings[handler_settings][target_bundles][tags]' => 'tags'], 'Save settings');
    $this->drupalGet('/admin/structure/types/manage/page/form-display');
    $this->submitForm([
      'fields[field_term_reference][type]' => 'readonly_field_widget',
    ], 'Save');

    // Add a simple text field.
    $this->drupalGet('/admin/structure/types/manage/page/fields/add-field');
    $this->submitForm([
      'new_storage_type' => 'string',
      'label' => 'some plain text',
      'field_name' => 'some_plain_text',
    ], 'Save and continue');
    $this->drupalGet('/admin/structure/types/manage/page/form-display');
    $this->submitForm([
      'fields[field_some_plain_text][type]' => 'readonly_field_widget',
    ], 'Save');
    $this->submitForm([], 'field_some_plain_text_settings_edit');
    $this->submitForm([
      'fields[field_some_plain_text][settings_edit_form][settings][label]' => 'above',
      'fields[field_some_plain_text][settings_edit_form][settings][formatter_type]' => 'string',
      'fields[field_some_plain_text][settings_edit_form][settings][show_description]' => TRUE,
      'fields[field_some_plain_text][settings_edit_form][settings][formatter_settings][string][link_to_entity]' => TRUE,
    ], 'Update');
    $this->submitForm([], 'Save');

    // Add a second text field.
    $this->drupalGet('/admin/structure/types/manage/page/fields/add-field');
    $this->submitForm([
      'new_storage_type' => 'string',
      'label' => 'restricted text',
      'field_name' => 'restricted_text',
    ], 'Save and continue');
    $this->drupalGet('/admin/structure/types/manage/page/form-display');
    $this->submitForm([
      'fields[field_restricted_text][type]' => 'readonly_field_widget',
    ], 'Save');
    $this->submitForm([], 'field_restricted_text_settings_edit');
    $this->submitForm([
      'fields[field_restricted_text][settings_edit_form][settings][label]' => 'above',
      'fields[field_restricted_text][settings_edit_form][settings][formatter_type]' => 'string',
      'fields[field_restricted_text][settings_edit_form][settings][show_description]' => TRUE,
      'fields[field_restricted_text][settings_edit_form][settings][formatter_settings][string][link_to_entity]' => TRUE,
    ], 'Update');
    $this->submitForm([], 'Save');

  }

  /**
   * Test field access on readonly fields.
   */
  public function testFieldAccess() {

    $assert = $this->assertSession();

    $test_string = $this->randomMachineName();
    $restricted_test_string = $this->randomMachineName();

    $article = $this->createNode([
      'type' => 'article',
      'title' => 'test-article',
    ]);

    $tag_term = Term::create(['vid' => 'tags', 'name' => 'test-tag']);
    $tag_term->save();

    $page = $this->createNode([
      'type' => 'page',
      'field_some_plain_text' => [['value' => $test_string]],
      'field_restricted_text' => [['value' => $restricted_test_string]],
      'field_article_reference' => $article,
      'field_term_reference' => $tag_term,
    ]);

    // As an admin, verify the widgets are readonly.
    $this->drupalLogin($this->admin);
    $this->drupalGet('node/' . $page->id() . '/edit');

    $field_wrapper = $assert->elementExists('css', '#edit-field-some-plain-text-wrapper');
    $this->assertContains($test_string, $field_wrapper->getHtml());
    $assert->elementNotExists('css', 'input', $field_wrapper);

    // This shouldn't be editable by admin, but they can view it.
    $field_wrapper = $assert->elementExists('css', '#edit-field-restricted-text-wrapper');
    $this->assertContains($restricted_test_string, $field_wrapper->getHtml());
    $assert->elementNotExists('css', 'input', $field_wrapper);

    $field_wrapper = $assert->elementExists('css', '#edit-field-article-reference-wrapper');
    $this->assertContains('test-article', $field_wrapper->getHtml());
    $title_element = $assert->elementExists('css', 'h2 a span', $field_wrapper);
    $this->assertEquals($title_element->getText(), 'test-article');
    $assert->elementNotExists('css', 'input', $field_wrapper);
    $assert->elementNotExists('css', 'select', $field_wrapper);

    $field_wrapper = $assert->elementExists('css', '#edit-field-term-reference-wrapper');
    $this->assertContains('test-tag', $field_wrapper->getHtml());
    $title_element = $assert->elementExists('css', '.field__item a', $field_wrapper);
    $this->assertEquals($title_element->getText(), 'test-tag');
    $assert->elementNotExists('css', 'input', $field_wrapper);
    $assert->elementNotExists('css', 'select', $field_wrapper);

    // Create a regular who can update page nodes.
    $user = $this->createUser(['edit any page content']);
    $this->drupalLogin($user);
    $this->drupalGet('node/' . $page->id() . '/edit');
    $field_wrapper = $assert->elementExists('css', '#edit-field-some-plain-text-wrapper');
    $this->assertContains($test_string, $field_wrapper->getHtml());
    $assert->elementNotExists('css', 'input', $field_wrapper);

    // This field is restricted via hooks in readonly_field_widget_test.module.
    $assert->elementNotExists('css', '#edit-field-restricted-text-wrapper');
    $this->assertNotContains($restricted_test_string, $this->getTextContent());

    $field_wrapper = $assert->elementExists('css', '#edit-field-article-reference-wrapper');
    $this->assertContains('test-article', $field_wrapper->getHtml());
    $title_element = $assert->elementExists('css', 'h2 a span', $field_wrapper);
    $this->assertEquals($title_element->getText(), 'test-article');
    $assert->elementNotExists('css', 'input', $field_wrapper);
    $assert->elementNotExists('css', 'select', $field_wrapper);

    $field_wrapper = $assert->elementExists('css', '#edit-field-term-reference-wrapper');
    $this->assertContains('test-tag', $field_wrapper->getHtml());
    $title_element = $assert->elementExists('css', '.field__item a', $field_wrapper);
    $this->assertEquals($title_element->getText(), 'test-tag');
    $assert->elementNotExists('css', 'input', $field_wrapper);
    $assert->elementNotExists('css', 'select', $field_wrapper);
  }

}
