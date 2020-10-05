<?php

namespace Drupal\Tests\elasticsearch_connector_autocomp\FunctionalJavascript;

use Drupal\FunctionalJavascriptTests\WebDriverTestBase;

/**
 * Defines a class for testing the form modifications.
 *
 * @group elasticsearch_connector_autocomp
 */
class IndexFormTest extends WebDriverTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'elasticsearch_connector_autocomp',
    'search_api',
    'elasticsearch_connector_autocomp_test',
    'node',
    'taxonomy',
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
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Tests confirm form behaviour.
   */
  public function testFormBehaviour() {
    // Login as admin.
    $this->drupalLogin($this->drupalCreateUser([], NULL, TRUE));
    $this->internalTestSaveSearchApiIndexForm();
    $this->internalTestConfirmForm();
    $this->internalTestTaxonomyIndex();
  }

  /**
   * Tests saving index form on new index not supplied by configuration.
   */
  public function internalTestSaveSearchApiIndexForm() {
    $this->drupalGet('/admin/config/search/search-api/add-index');

    $this->getSession()->getPage()->fillField('name', 'Search API Index');
    // Wait a short time for the machine name to sort itself out when running
    // this as a javascript test.
    $this->getSession()->wait(5000, "jQuery('#edit-name-machine-name-suffix').length");

    $this->getSession()->getPage()->checkField('datasources[entity:node]');
    // Wait a short time for the datasource config fields to sort itself out
    // when running this as a javascript test.
    $this->getSession()->wait(5000, "jQuery('details[data-drupal-selector=edit-datasource-configs-entitynode]').length");
    $this->getSession()->wait('10000');

    $this->submitForm([], 'Save');

    // Form validations needs a machine name. javascript is unavailable to fill
    // it in. Now that the form just failed validation, the field is available
    // to fill in.
    $this->getSession()->getPage()->fillField('id', 'search_api_index');
    $this->submitForm([], 'Save');

    $this->assertSession()->pageTextContainsOnce("The index was successfully saved.");
    $this->assertSession()->pageTextContainsOnce("Search API Index");

  }

  /**
   * Tests confirm form behaviour.
   */
  public function internalTestConfirmForm() {
    /** @var \Drupal\search_api\IndexInterface $index */
    $indexStorage = $this->container->get('entity_type.manager')->getStorage('search_api_index');
    $index = $indexStorage->load('elasticsearch_index');

    // Assert that the ngram filter is disabled in configuration.
    $this->assertFalse($index->getThirdPartySetting('elasticsearch_connector', 'ngram_filter_enabled', FALSE));

    // Tests the ngram filter check box exists on our form.
    $this->drupalGet($index->toUrl('edit-form'));
    $assert = $this->assertSession();
    $assert->fieldExists('third_party_settings[elasticsearch_connector][ngram_filter_enabled]');

    // If the fieldset isn't open, webdriver gets upset when the form is
    // submitted. "field isn't visible" error.
    // Open the fieldset.
    $node = $this->getSession()->getPage()->find('css', "#edit-third-party-settings-elasticsearch-connector");
    $node->click();

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
    $this->assertNotEmpty($index->getThirdPartySetting('elasticsearch_connector', 'ngram_filter_enabled', FALSE));
    // And the name should be changed.
    $this->assertEquals('A new name for the index', $index->label());
    $this->internalTestTaxonomyIndex($indexStorage);

  }

  /**
   * Tests showing fields for taxonomy based indices.
   */
  public function internalTestTaxonomyIndex() {
    /** @var \Drupal\search_api\IndexInterface $index */
    $indexStorage = $this->container->get('entity_type.manager')->getStorage('search_api_index');

    // Test hook_form_search_api_index_fields_alter, see issue #3006322.
    $index = $indexStorage->load('taxonomy_term_index');
    $this->drupalGet($index->toUrl('fields'));
    $assert = $this->assertSession();
    $assert->optionExists('fields[name][type]', 'text_ngram');

    $field_name = $this->xpath('//select[@id="edit-fields-name-boost"]');
    $states = (array) json_decode($field_name[0]->getAttribute('data-drupal-states'), TRUE);
    $field_visible = $states['visible'][':input[name="fields[name][type]"]'];
    $values = array_column($field_visible, 'value');

    $this->assertContains('text_ngram', $values, 'Field "name" updated in elasticsearch_connector_autocomp_form_search_api_index_fields_alter()');
  }

}
