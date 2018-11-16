<?php

namespace Drupal\Tests\elasticsearch_connector_autocomp\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Defines a class for testing the form modifications.
 *
 * @group elasticsearch_connector_autocomp
 */
class IndexFormTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'elasticsearch_connector_autocomp',
    'search_api',
    'elasticsearch_connector_autocomp_test',
    'node',
    'filter',
    'options',
    'text',
    'elasticsearch_connector',
    'system',
    'user',
  ];

  /**
   * {@inheritdoc}
   */
  protected $strictConfigSchema = FALSE;

  /**
   * Tests confirm form behaviour.
   */
  public function testFormBehaviour() {
    /** @var \Drupal\search_api\IndexInterface $index */
    $indexStorage = $this->container->get('entity_type.manager')->getStorage('search_api_index');
    $index = $indexStorage->load('elasticsearch_index');

    // Should not yet be set.
    $this->assertFalse($index->getThirdPartySetting('elasticsearch_connector', 'ngram_filter_enabled', FALSE));

    // Login as admin.
    $this->drupalLogin($this->drupalCreateUser([], NULL, TRUE));

    // Tests the check box exists on our form.
    $this->drupalGet($index->toUrl('edit-form'));
    $assert = $this->assertSession();
    $assert->fieldExists('third_party_settings[elasticsearch_connector][ngram_filter_enabled]');
    $this->submitForm([
      'name' => 'A new name for the index',
      'third_party_settings[elasticsearch_connector][ngram_filter_enabled]' => 1,
    ], 'Save');

    // Flag should still be disabled at this stage.
    $indexStorage->resetCache();
    $index = $indexStorage->load('elasticsearch_index');
    $this->assertFalse($index->getThirdPartySetting('elasticsearch_connector', 'ngram_filter_enabled', FALSE));
    // And the name should be unchanged.
    $this->assertEquals('Test index using elasticsearch module', $index->label());

    // Should be a confirm form.
    $assert->pageTextContains('You are changing the analyzer on an existing index.');
    $assert->pageTextContains('This will result in the index being deleted and rebuilt and you will have to reindex all items. Are you sure you want to continue?');

    // Submit the confirm form.
    $this->submitForm([], 'Confirm');

    // Flag should now be set.
    $indexStorage->resetCache();
    $index = $indexStorage->load('elasticsearch_index');
    $this->assertTrue($index->getThirdPartySetting('elasticsearch_connector', 'ngram_filter_enabled', FALSE));
    // And the name should be unchanged.
    $this->assertEquals('A new name for the index', $index->label());
  }

}
