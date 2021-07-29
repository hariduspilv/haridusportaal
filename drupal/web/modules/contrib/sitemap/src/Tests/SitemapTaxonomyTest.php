<?php

namespace Drupal\sitemap\Tests;

/**
 * Tests the display of taxonomies based on sitemap settings.
 *
 * @group sitemap
 */
class SitemapTaxonomyTest extends SitemapTaxonomyTestBase {

  use SitemapTestTrait;

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['sitemap', 'node', 'taxonomy'];

  /**
   * Tests vocabulary title.
   */
  public function testVocabularyTitle() {
    // The vocabulary is already configured to display in parent ::setUp().
    $vocab = $this->vocabulary;
    $vid = $vocab->id();

    $this->titleTest($vocab->label(), 'vocabulary', $vid, TRUE);
  }

  /**
   * Tests vocabulary description.
   */
  public function testVocabularyDescription() {
    // The vocabulary is already configured to display in ::setUp().
    $vid = $this->vocabulary->id();

    // Assert that vocabulary description is not included by default.
    $this->drupalGet('/sitemap');
    $elements = $this->cssSelect(".sitemap-plugin--vocabulary");
    $this->assertEquals(count($elements), 1, 'Vocabulary found.');
    $this->assertSession()->pageTextNotContains($this->vocabulary->getDescription());

    // Display the description.
    $this->saveSitemapForm(["plugins[vocabulary:$vid][settings][show_description]" => TRUE]);
    $this->assertSession()->pageTextContains($this->vocabulary->getDescription());

    // Create taxonomy terms.
    $this->createTerms($this->vocabulary);

    // Set to show all taxonomy terms, even if they are not assigned to any
    // nodes.
    $this->saveSitemapForm([ "plugins[vocabulary:$vid][settings][term_count_threshold]" => -1]);

    // Assert that the vocabulary description is included in the sitemap when
    // terms are displayed.
    $this->drupalGet('/sitemap');
    $this->assertSession()->pageTextContains($this->vocabulary->getDescription());

    // Configure sitemap not to show vocabulary descriptions.
    $this->saveSitemapForm(["plugins[vocabulary:$vid][settings][show_description]" => FALSE]);

    // Assert that vocabulary description is not included in the sitemap.
    $this->drupalGet('/sitemap');
    $this->assertSession()->pageTextNotContains($this->vocabulary->getDescription());
  }

  /**
   * Test seamless functionality when created and deleting vocabularies.
   */
  public function testVocabularyCrud() {
    // Create an additional vocabulary.
    $vocabularyToDelete = $this->createVocabulary();

    // Configure the sitemap to display both vocabularies.
    $vid = $this->vocabulary->id();
    $vid_to_delete = $vocabularyToDelete->id();
    $edit = [
      "plugins[vocabulary:$vid][enabled]" => TRUE,
      "plugins[vocabulary:$vid_to_delete][enabled]" => TRUE,
    ];
    $this->saveSitemapForm($edit);

    // Ensure that both vocabularies are displayed.
    $this->drupalGet('/sitemap');

    $elements = $this->cssSelect(".sitemap-plugin--vocabulary");
    $this->assertEquals(count($elements), 2, '2 vocabularies are included');

    $elements = $this->cssSelect(".sitemap-item--vocabulary-$vid");
    $this->assertEquals(count($elements), 1, "Vocabulary $vid is included.");
    $elements = $this->cssSelect(".sitemap-item--vocabulary-$vid_to_delete");
    $this->assertEquals(count($elements), 1, "Vocabulary $vid_to_delete is included.");

    // Delete the vocabulary.
    $vocabularyToDelete->delete();
    // @todo We shouldn't have to do this if vocab cache tags are in place...
    drupal_flush_all_caches();

    // Visit /sitemap.
    $this->drupalGet('/sitemap');
    $elements = $this->cssSelect(".sitemap-plugin--vocabulary");
    $this->assertEquals(count($elements), 1, '1 vocabulary is included');

    $elements = $this->cssSelect(".sitemap-item--vocabulary-$vid");
    $this->assertEquals(count($elements), 1, "Vocabulary $vid is included.");
    $elements = $this->cssSelect(".sitemap-item--vocabulary-$vid_to_delete");
    $this->assertEquals(count($elements), 0, "Vocabulary $vid_to_delete is included.");

    // Visit the sitemap configuration page to ensure no errors there.
    $this->drupalGet('/admin/config/search/sitemap');
  }

}
