<?php

namespace Drupal\search_api_elasticsearch_synonym\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure Search API Elasticsearch Synonym.
 */
class SearchApiElasticsearchSynonymSettingsForm extends ConfigFormBase {

  /**
   * Config settings.
   *
   * @var string
   */
  const SETTINGS = 'search_api_elasticsearch_synonym.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'search_api_elasticsearch_synonym_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      static::SETTINGS,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(static::SETTINGS);

    $form['enable'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Enable synonyms'),
      '#default_value' => $config->get('enable'),
      '#description' => $this->t('Change of this option requires index removal and reindexing.')
    );

    $form['token_filter_type'] = array(
      '#type' => 'select',
      '#title' => $this->t('Token Filter Type'),
      '#default_value' => $config->get('token_filter_type'),
      '#options' => array(
        'synonym' => $this->t('Synonym'),
        'synonym_graph' => $this->t('Synonym Graph'),
      ),
      '#description' => $this->t('Use "Synonym" if you are using single word synonyms.  Use "Synonym Graph" if you are using any multi-word synonyms.'),
    );

    $form['synonyms'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Synonyms'),
      '#default_value' => $config->get('synonyms'),
      '#description' => $this->t('Enter synonyms in the <a href=":url">Solr format</a>.', array(
        ':url' => 'https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-synonym-tokenfilter.html#_solr_synonyms'
      ))
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->configFactory->getEditable(static::SETTINGS)
      ->set('enable', $form_state->getValue('enable'))
      ->save();

    $this->configFactory->getEditable(static::SETTINGS)
      ->set('token_filter_type', $form_state->getValue('token_filter_type'))
      ->save();

    $this->configFactory->getEditable(static::SETTINGS)
      ->set('synonyms', $form_state->getValue('synonyms'))
      ->save();

    parent::submitForm($form, $form_state);
  }

}
