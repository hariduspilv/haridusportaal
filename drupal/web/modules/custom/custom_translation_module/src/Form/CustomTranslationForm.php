<?php

namespace Drupal\custom_translation_module\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class CustomTranslationForm.
 */
class CustomTranslationForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'custom_translation_module.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'custom_translation_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('custom_translation_module.settings');

    $form['#tree'] = TRUE;

		$form['article_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Article translations'),
			#'#tree' => TRUE,
		];
		$form['article_translations']['contact'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Contact'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('article_translations.contact'),
		];
		$form['article_translations']['hyperlinks'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Hyperlinks'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('article_translations.hyperlinks'),
		];
		$form['article_translations']['similar_articles'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Similar articles'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('article_translations.similar_articles'),
		];

		$form['news_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('News translations'),
		];
		$form['news_translations']['news'] = [
			'#type' => 'textfield',
			'#title' => $this->t('News'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news_translations.news'),
		];
		$form['news_translations']['news_all'] = [
			'#type' => 'textfield',
			'#title' => $this->t('All news'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news_translations.news_all'),
		];
		$form['news_translations']['recent_news'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Recent news'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news_translations.recent_news'),
		];

		$form['events_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Events translations'),
		];
		$form['events_translations']['events'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Events'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.events'),
		];
		$form['events_translations']['event_tag'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event tags'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.event_tag'),
		];
		$form['events_translations']['event_status'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event status'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.event_status'),
		];
		$form['events_translations']['occurrence'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event date'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.occurrence'),
		];
		$form['events_translations']['occurrence_location'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event date and location'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.occurrence_location'),
		];
		$form['events_translations']['location'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Location'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.location'),
		];
		$form['events_translations']['links_files'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Links and files'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('events_translations.links_files'),
		];

		$form['login_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Login translations'),
		];
		$form['login_translations']['username'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Username'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('login_translations.username'),
		];
		$form['login_translations']['password'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Password'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('login_translations.password'),
		];
		$form['login_translations']['login_error'] = [
			'#type' => 'textarea',
			'#title' => $this->t('Login error message'),
			'#maxlength' => 200,
			'#size' => 64,
			'#default_value' => $config->get('login_translations.login_error'),
		];


		$form['date_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Date & Time translations'),
		];
		$form['date_translations']['date'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Date'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.date'),
		];
		$form['date_translations']['date_format'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Date format'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.date_format'),
		];
		$form['date_translations']['monday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Monday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.monday'),
		];
		$form['date_translations']['tuesday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Tuesday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.tuesday'),
		];
		$form['date_translations']['wednesday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Wednesday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.wednesday'),
		];
		$form['date_translations']['thursday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Thursday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.thursday'),
		];
		$form['date_translations']['friday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Friday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.friday'),
		];
		$form['date_translations']['saturday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Saturday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.saturday'),
		];
		$form['date_translations']['sunday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Sunday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('date_translations.sunday'),
		];


		$form['search_filter_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Search & filter'),
		];
		$form['search_filter_translations']['search_news_name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Enter news name'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('search_filter_translations.search_news_name'),
		];
		$form['search_filter_translations']['search_event_tags'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search event tags'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('search_filter_translations.search_event_tags'),
		];
		$form['search_filter_translations']['search_event_types'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search event types'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('search_filter_translations.search_event_types'),
		];
		$form['search_filter_translations']['results_none'] = [
			'#type' => 'textfield',
			'#title' => $this->t('No results'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('search_filter_translations.results_none'),
		];
		$form['search_filter_translations']['date_from'] = [
				'#type' => 'textfield',
				'#title' => $this->t('Date from'),
				'#maxlength' => 64,
				'#size' => 64,
				'#default_value' => $config->get('search_filter_translations.date_from'),
		];
		$form['search_filter_translations']['date_to'] = [
				'#type' => 'textfield',
				'#title' => $this->t('Date to'),
				'#maxlength' => 64,
				'#size' => 64,
				'#default_value' => $config->get('search_filter_translations.date_to'),
		];


		$form['button_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Buttons'),
		];
		$form['button_translations']['search'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.search'),
		];
		$form['button_translations']['load_more'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Load more'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.load_more'),
		];
		$form['button_translations']['read_more'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Read more'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.read_more'),
		];
		$form['button_translations']['show_all'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Show all'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.show_all'),
		];
		$form['button_translations']['register'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Register'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.register'),
		];
		$form['button_translations']['calendar_add'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Add to calendar'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.calendar_add'),
		];
		$form['button_translations']['search_detailed'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Detailed search'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.search_detailed'),
		];
		$form['button_translations']['search_close'] = [
				'#type' => 'textfield',
				'#title' => $this->t('Close search'),
				'#maxlength' => 64,
				'#size' => 64,
				'#default_value' => $config->get('button_translations.search_close'),
		];
		$form['button_translations']['login'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Login'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.login'),
		];
		$form['button_translations']['logout'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Logout'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.logout'),
		];
		$form['button_translations']['filter_close'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Filter close'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.filter_close'),
		];
		$form['button_translations']['filter'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Filter'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.filter'),
		];
		$form['button_translations']['choose_type'] = [
				'#type' => 'textfield',
				'#title' => $this->t('Choose type'),
				'#maxlength' => 64,
				'#size' => 64,
				'#default_value' => $config->get('button_translations.choose_type'),
		];

		$form['form_label_translations'] = [
			'#type' => 'details',
			'#title' => $this->t('Form labels'),
		];
		$form['form_label_translations']['search_by_keyword'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search by keyword'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('form_label_translations.search_by_keyword'),
		];
		$form['form_label_translations']['search_events_name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search events by name'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('form_label_translations.search_events_name'),
		];
		$form['form_label_translations']['search_people'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search people'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('form_label_translations.search_people'),
		];


		return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
		$config = $this->config('custom_translation_module.settings');

		foreach ($form_state->cleanValues()->getValues() as $key => $value){
			if(!empty($value)) $config->set($key, $value);
		}

		$config->save();
  }

}
