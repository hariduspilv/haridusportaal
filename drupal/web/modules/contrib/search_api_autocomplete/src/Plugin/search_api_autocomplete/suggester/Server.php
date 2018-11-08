<?php

namespace Drupal\search_api_autocomplete\Plugin\search_api_autocomplete\suggester;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\PluginFormInterface;
use Drupal\search_api\IndexInterface;
use Drupal\search_api\Plugin\PluginFormTrait;
use Drupal\search_api\Query\QueryInterface;
use Drupal\search_api_autocomplete\AutocompleteBackendInterface;
use Drupal\search_api_autocomplete\SearchInterface;
use Drupal\search_api_autocomplete\Suggester\SuggesterPluginBase;

/**
 * Provides a suggester plugin that retrieves suggestions from the server.
 *
 * The server needs to support the "search_api_autocomplete" feature for this to
 * work.
 *
 * @SearchApiAutocompleteSuggester(
 *   id = "server",
 *   label = @Translation("Retrieve from server"),
 *   description = @Translation("Make suggestions based on the data indexed on the server."),
 * )
 */
class Server extends SuggesterPluginBase implements PluginFormInterface {

  use PluginFormTrait;

  /**
   * {@inheritdoc}
   */
  public static function supportsSearch(SearchInterface $search) {
    return (bool) static::getBackend($search->getIndex());
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'fields' => [],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    // Let the user select the fulltext fields to use for autocomplete.
    $search = $this->getSearch();
    $fields = $search->getIndex()->getFields();
    $fulltext_fields = $search->getIndex()->getFulltextFields();
    $options = [];
    foreach ($fulltext_fields as $field) {
      $options[$field] = $fields[$field]->getFieldIdentifier();
    }
    $form['fields'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('Override used fields'),
      '#description' => $this->t('Select the fields which should be searched for matches when looking for autocompletion suggestions. Leave blank to use the same fields as the underlying search.'),
      '#options' => $options,
      '#default_value' => array_combine($this->getConfiguration()['fields'], $this->getConfiguration()['fields']),
      '#attributes' => ['class' => ['search-api-checkboxes-list']],
    ];
    $form['#attached']['library'][] = 'search_api/drupal.search_api.admin_css';

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $values['fields'] = array_keys(array_filter($values['fields']));
    $this->setConfiguration($values);
  }

  /**
   * {@inheritdoc}
   */
  public function getAutocompleteSuggestions(QueryInterface $query, $incomplete_key, $user_input) {
    if (!($backend = static::getBackend($this->getSearch()->getIndex()))) {
      return [];
    }

    if ($this->configuration['fields']) {
      $query->setFulltextFields($this->configuration['fields']);
    }
    return $backend->getAutocompleteSuggestions($query, $this->getSearch(), $incomplete_key, $user_input);
  }

  /**
   * Retrieves the backend for the given index, if it supports autocomplete.
   *
   * @param \Drupal\search_api\IndexInterface $index
   *   The search index.
   *
   * @return \Drupal\search_api_autocomplete\AutocompleteBackendInterface|null
   *   The backend plugin of the index's server, if it exists and supports
   *   autocomplete; NULL otherwise.
   */
  protected static function getBackend(IndexInterface $index) {
    if (!$index->hasValidServer()) {
      return NULL;
    }
    $server = $index->getServerInstance();
    $backend = $server->getBackend();
    if ($server->supportsFeature('search_api_autocomplete') || $backend instanceof AutocompleteBackendInterface) {
      return $backend;
    }
    return NULL;
  }

}
