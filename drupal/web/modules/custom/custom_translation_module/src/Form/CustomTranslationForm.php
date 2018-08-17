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

		$form['frontpage'] = [
			'#type' => 'details',
			'#title' => $this->t('Frontpage translations'),
			#'#tree' => TRUE,
		];
		$form['frontpage']['label'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Frontpage label'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('frontpage.label'),
		];
		$form['frontpage']['navigate'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Goto frontpage'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('frontpage.navigate'),
		];

		$form['article'] = [
			'#type' => 'details',
			'#title' => $this->t('Article translations'),
			#'#tree' => TRUE,
		];
		$form['article']['contact'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Contact'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('article.contact'),
		];
		$form['article']['hyperlinks'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Hyperlinks'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('article.hyperlinks'),
		];
		$form['article']['similar_articles'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Similar articles'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('article.similar_articles'),
		];

		$form['news'] = [
			'#type' => 'details',
			'#title' => $this->t('News translations'),
		];
		$form['news']['label'] = [
			'#type' => 'textfield',
			'#title' => $this->t('News'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news.label'),
		];
		$form['news']['all'] = [
			'#type' => 'textfield',
			'#title' => $this->t('All news'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news_translations.news_all'),
		];
		$form['news']['recent'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Recent news'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news_translations.recent_news'),
		];
		$form['news']['filter_name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('News name filter label'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news.filter_name'),
		];
		$form['news']['filter_tag'] = [
			'#type' => 'textfield',
			'#title' => $this->t('News tag filter label'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news.filter_tag'),
		];
		$form['news']['title'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Title'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news.title'),
		];
		$form['news']['no_results'] = [
			'#type' => 'textfield',
			'#title' => $this->t('No results'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('news.no_results'),
		];


		$form['event'] = [
			'#type' => 'details',
			'#title' => $this->t('Events translations'),
		];
		$form['event']['label'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Events label'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.label'),
		];
		$form['event']['tags'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event tags'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.tags'),
		];
		$form['event']['status'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event status'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.status'),
		];
		$form['event']['free'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event status free'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.free'),
		];
		$form['event']['register'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event status register'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.register'),
		];
		$form['event']['invite'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event status invite'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.invite'),
		];
		$form['event']['practical_info'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event practical info'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.practical_info'),
		];
		$form['event']['passed'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event passed'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.passed'),
		];
		$form['event']['group'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event group'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.group'),
		];
		$form['event']['list'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event list'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.list'),
		];
		$form['event']['calendar'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Calendar'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.calendar'),
		];
		$form['event']['entrance'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Entrance'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.entrance'),
		];
		$form['event']['related'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Related events'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.related'),
		];
		$form['event']['start_time'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Start time'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.start_time'),
		];
		$form['event']['location'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Location'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.location'),
		];
		$form['event']['place_and_time'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event time and place'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.place_and_time'),
		];
		$form['event']['participant_email'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant email'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_email'),
		];
		$form['event']['participant_phone'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant phone'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_phone'),
		];
		$form['event']['participant_last_name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant last name'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_last_name'),
		];
		$form['event']['participant_first_name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant first name'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_first_name'),
		];
		$form['event']['participant_organization'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant organization'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_organization'),
		];
		$form['event']['participant_created'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant registration time'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_created'),
		];
		$form['event']['participant_comment'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant comment'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_comment'),
		];
		$form['event']['participant_index'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant index'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_index'),
		];
		$form['event']['participant_list'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant list'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_list'),
		];
		$form['event']['participant_count'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant count'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participant_count'),
		];
		$form['event']['participants_list_view'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Participant list view'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.participants_list_view'),
		];
		$form['event']['filter_name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Filter event name'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.filter_name'),
		];
		$form['event']['filter_tags'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Filter event tags'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.filter_tags'),
		];
		$form['event']['filter_types'] = [
			'#type' => 'textfield',
			'#title' => $this->t('filter event types'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.filter_types'),
		];
		$form['event']['filter_status'] = [
			'#type' => 'textfield',
			'#title' => $this->t('filter event status'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.filter_status'),
		];
		$form['event']['contact'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event contact'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.contact'),
		];
		$form['event']['registration_form'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event registration form'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form'),
		];
		$form['event']['registration_form_required'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event contact'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_required'),
		];
		$form['event']['registration_form_valid_email'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Email label validation'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_valid_email'),
		];
		$form['event']['registration_form_send'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Send'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_send'),
		];
		$form['event']['registration_form_close'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Close window'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_close'),
		];
		$form['event']['registration_form_cancel'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Cancel registration'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_cancel'),
		];
		$form['event']['registration_form_thanks'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event registration confirmation text'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_thanks'),
		];
		$form['event']['registration_form_add_to_calendar'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Add to calendar'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_form_add_to_calendar'),
		];
		$form['event']['registration_ended'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event registration ended'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_ended'),
		];
		$form['event']['registration_not_started'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event registration not started'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_not_started'),
		];
		$form['event']['registration_full'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Event registration is full'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('event.registration_full'),
		];


		$form['login'] = [
			'#type' => 'details',
			'#title' => $this->t('Login translations'),
		];
		$form['login']['username'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Username'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('login.username'),
		];
		$form['login']['password'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Password'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('login.password'),
		];
		$form['login']['error'] = [
			'#type' => 'textarea',
			'#title' => $this->t('Login error message'),
			'#maxlength' => 200,
			'#size' => 64,
			'#default_value' => $config->get('login.error'),
		];
		$form['login']['success'] = [
			'#type' => 'textarea',
			'#title' => $this->t('Login error success'),
			'#maxlength' => 200,
			'#size' => 64,
			'#default_value' => $config->get('login.success'),
		];

		$form['time'] = [
			'#type' => 'details',
			'#title' => $this->t('Date & Time translations'),
		];
		$form['time']['date'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Date'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.date'),
		];
		$form['time']['date_format'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Date format'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.date_format'),
		];
		$form['time']['monday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Monday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.monday'),
		];
		$form['time']['monday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Monday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.monday_short'),
		];
		$form['time']['tuesday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Tuesday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.tuesday'),
		];
		$form['time']['tuesday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Tuesday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.tuesday_short'),
		];
		$form['time']['wednesday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Wednesday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.wednesday'),
		];
		$form['time']['wednesday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Wednesday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.wednesday_short'),
		];
		$form['time']['thursday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Thursday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.thursday'),
		];
		$form['time']['thursday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Thursday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.thursday_short'),
		];
		$form['time']['friday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Friday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.friday'),
		];
		$form['time']['friday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Friday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.friday_short'),
		];
		$form['time']['saturday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Saturday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.saturday'),
		];
		$form['time']['saturday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Saturday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.saturday_short'),
		];
		$form['time']['sunday'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Sunday'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.sunday'),
		];
		$form['time']['sunday_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Sunday short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.sunday_short'),
		];
		$form['time']['january'] = [
			'#type' => 'textfield',
			'#title' => $this->t('January'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.january'),
		];
		$form['time']['february'] = [
			'#type' => 'textfield',
			'#title' => $this->t('February'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.february'),
		];
		$form['time']['march'] = [
			'#type' => 'textfield',
			'#title' => $this->t('March'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.march'),
		];
		$form['time']['april'] = [
			'#type' => 'textfield',
			'#title' => $this->t('April'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.april'),
		];
		$form['time']['may'] = [
			'#type' => 'textfield',
			'#title' => $this->t('May'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.may'),
		];
		$form['time']['june'] = [
			'#type' => 'textfield',
			'#title' => $this->t('June'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.june'),
		];
		$form['time']['july'] = [
			'#type' => 'textfield',
			'#title' => $this->t('July'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.july'),
		];
		$form['time']['august'] = [
			'#type' => 'textfield',
			'#title' => $this->t('August'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.august'),
		];
		$form['time']['september'] = [
			'#type' => 'textfield',
			'#title' => $this->t('September'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.september'),
		];
		$form['time']['october'] = [
			'#type' => 'textfield',
			'#title' => $this->t('October'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.october'),
		];
		$form['time']['november'] = [
			'#type' => 'textfield',
			'#title' => $this->t('November'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.november'),
		];
		$form['time']['december'] = [
			'#type' => 'textfield',
			'#title' => $this->t('December'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.december'),
		];
		$form['time']['date_period_from'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Date from'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.date_period_from'),
		];
		$form['time']['date_period_to'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Date to'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.date_period_to'),
		];
		$form['time']['from'] = [
			'#type' => 'textfield',
			'#title' => $this->t('From'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.from'),
		];
		$form['time']['to'] = [
			'#type' => 'textfield',
			'#title' => $this->t('To'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.to'),
		];
		$form['time']['duration_year_singular'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Year singular'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.duration_year_singular'),
		];
		$form['time']['duration_year_plural'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Year plural'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.duration_year_plural'),
		];
		$form['time']['duration_month_singular'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Month singular'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.duration_month_singular'),
		];
		$form['time']['duration_month_plural'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Month plural'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.duration_month_plural'),
		];
		$form['time']['time_of_day'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Time'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('time.time_of_day'),
		];

		$form['button'] = [
			'#type' => 'details',
			'#title' => $this->t('Buttons'),
		];
		$form['button']['search'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search'),
		];
		$form['button']['load_more'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Load more'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.load_more'),
		];
		$form['button']['all'] = [
			'#type' => 'textfield',
			'#title' => $this->t('All'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.all'),
		];
		$form['button']['map_closer'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Look map closer'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.map_closer'),
		];
		$form['button']['add_to_comparison'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Add to comparison'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.add_to_comparison'),
		];
		$form['button']['search_people'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search people'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_people'),
		];
		$form['button']['view_all'] = [
			'#type' => 'textfield',
			'#title' => $this->t('View all'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.view_all'),
		];
		$form['button']['view_more'] = [
			'#type' => 'textfield',
			'#title' => $this->t('View more'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.view_more'),
		];
		$form['button']['read_more'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Read more'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.read_more'),
		];
		$form['button']['show_all'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Show all'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.show_all'),
		];
		$form['button']['register'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Register'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.register'),
		];
		$form['button']['calendar_add'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Add to calendar'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button_translations.calendar_add'),
		];
		$form['button']['search_detailed'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Detailed search'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_detailed'),
		];
		$form['button']['search_detailed_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Detailed search short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_detailed_short'),
		];
		$form['button']['search_brief'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Breaf search'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_brief'),
		];
		$form['button']['search_brief_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Breaf search short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_brief_short'),
		];
		$form['button']['search_close'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Close search'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_close'),
		];
		$form['button']['login'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Login'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.login'),
		];
		$form['button']['logout'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Logout'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.logout'),
		];
		$form['button']['filter_close'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Filter close'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.filter_close'),
		];
		$form['button']['filter'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Filter'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.filter'),
		];
		$form['button']['search_people'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Search people'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.search_people'),
		];
		$form['button']['newsletter_submit'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Submit newsletter'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.newsletter_submit'),
		];
		$form['button']['choose_type'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Choose type'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('button.choose_type'),
		];

		$form['newsletter'] = [
			'#type' => 'details',
			'#title' => $this->t('Newsletter translations'),
		];
		$form['newsletter']['title'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter title'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.title'),
		];
		$form['newsletter']['intro'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter introduction'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.intro'),
		];
		$form['newsletter']['confirm_subscription'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Confirm subscription'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.confirm_subscription'),
		];
		$form['newsletter']['email'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Email'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.email'),
		];
		$form['newsletter']['valid_email'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Enter valid email'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.valid_email'),
		];
		$form['newsletter']['modal_title'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter modal title'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.modal_title'),
		];
		$form['newsletter']['modal_content'] = [
			'#type' => 'text_format',
			'#title' => $this->t('Newsletter modal content'),
			#'#default_value' => $config->get('newsletter.modal_content')['value'],
		];
		$form['newsletter']['modal_close'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter modal close'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.modal_close'),
		];
		$form['newsletter']['unsubscribe_title'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter unsubscribe title'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.unsubscribe_title'),
		];
		$form['newsletter']['unsubscribe_content'] = [
			'#type' => 'text_format',
			'#title' => $this->t('Newsletter unsubscribe content'),
			'#default_value' => $config->get('newsletter.unsubscribe_content')['value'],
		];
		$form['newsletter']['subscription_thanks_content'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter subscription thank you text'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.subscription_thanks_content'),
		];
		$form['newsletter']['subscription_thanks_subcontent'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter subscription thank you subtext'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.subscription_thanks_subcontent'),
		];
		$form['newsletter']['subscription_choose_one'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter text choose at least one'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.subscription_choose_one'),
		];
		$form['newsletter']['subscription_failed'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Newsletter subscription failed text'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('newsletter.subscription_failed'),
		];

		$form['school'] = [
			'#type' => 'details',
			'#title' => $this->t('School translations'),
		];
		$form['school']['label'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School label'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.label'),
		];
		$form['school']['institutions'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School institutions'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.institutions'),
		];
		$form['school']['location'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School location'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.location'),
		];
		$form['school']['name'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School name'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.name'),
		];
		$form['school']['institution_type'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School institution type'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.institution_type'),
		];
		$form['school']['institution_select_type'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School institution select type'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.institution_select_type'),
		];
		$form['school']['institution_sublevel'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School institution sublevel'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.institution_sublevel'),
		];
		$form['school']['language'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School language'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.language'),
		];
		$form['school']['ownership'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School ownership'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.ownership'),
		];
		$form['school']['available_dormitory'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School available dormitory'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.available_dormitory'),
		];
		$form['school']['dormitory'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School dormitory'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.dormitory'),
		];
		$form['school']['special_needs_long'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School special needs long'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.special_needs_long'),
		];
		$form['school']['special_needs_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School special needs short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.special_needs_short'),
		];
		$form['school']['list'] = [
			'#type' => 'textfield',
			'#title' => $this->t('List'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.list'),
		];
		$form['school']['map'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Map'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.map'),
		];
		$form['school']['no_result'] = [
			'#type' => 'textfield',
			'#title' => $this->t('No result'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.no_result'),
		];
		$form['school']['legal_address'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School legal address'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.legal_address'),
		];
		$form['school']['defacto_address'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School defacto address'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.defacto_address'),
		];
		$form['school']['website'] = [
			'#type' => 'textfield',
			'#title' => $this->t('School website address'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.website'),
		];
		$form['school']['contact_info'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Contact info'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.contact_info'),
		];
		$form['school']['contact'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Contact'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.contact'),
		];
		$form['school']['register_code_short'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Register code short'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.register_code_short'),
		];
		$form['school']['available'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Available'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.available'),
		];
		$form['school']['unavailable'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Unavailable'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('school.unavailable'),
		];

		$form['studyProgramme'] = [
			'#type' => 'details',
			'#title' => $this->t('Study programme translations'),
		];
		$form['studyProgramme']['label'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme label'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.label'),
		];
		$form['studyProgramme']['level'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme level'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.level'),
		];
		$form['studyProgramme']['accreditation'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme accreditation'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.accreditation'),
		];
		$form['studyProgramme']['valid_accreditation'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme valid accreditation'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.valid_accreditation'),
		];
		$form['studyProgramme']['accreditation_decision'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme accreditation decision'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.accreditation_decision'),
		];
		$form['studyProgramme']['accreditation_decision_till'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme accreditation decision till'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.accreditation_decision_till'),
		];

		$form['studyProgramme']['languages'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme languages'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.languages'),
		];
		$form['studyProgramme']['study_duration'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme duration'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.study_duration'),
		];
		$form['studyProgramme']['study_group'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme group'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.study_group'),
		];
		$form['studyProgramme']['admission_status'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme admission status'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.admission_status'),
		];


		$form['studyProgramme']['compare_modal_close'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Compare modal close'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.compare_modal_close'),
		];
		$form['studyProgramme']['school'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme school'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.school'),
		];
		$form['studyProgramme']['degree_or_diploma'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Degree or diploma'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.degree_or_diploma'),
		];
		$form['studyProgramme']['specialization'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme specialization'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.specialization'),
		];
		$form['studyProgramme']['study_capacity'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme study capacity'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.study_capacity'),
		];
		$form['studyProgramme']['internship_capacity'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme internship capacity'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.internship_capacity'),
		];
		$form['studyProgramme']['nominal_time'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme nominal time'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.nominal_time'),
		];

		$form['studyProgramme']['filter_title'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter title'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_title'),
		];
		$form['studyProgramme']['filter_type'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter type'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_type'),
		];
		$form['studyProgramme']['filter_language'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter language'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_language'),
		];
		$form['studyProgramme']['filter_school'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter school'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_school'),
		];
		$form['studyProgramme']['filter_location'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter location'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_location'),
		];
		$form['studyProgramme']['filter_iscedf_broad'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter iscedf broad'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_iscedf_broad'),
		];
		$form['studyProgramme']['filter_iscedf_narrow'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter iscedf narrow'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_iscedf_narrow'),
		];
		$form['studyProgramme']['filter_iscedf_detailed'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter iscedf detailed'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_iscedf_detailed'),
		];
		$form['studyProgramme']['filter_open_admission'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter open admission'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.filter_open_admission'),
		];
		$form['studyProgramme']['no_result'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Study programme filter no result'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('studyProgramme.no_result'),
		];

		$form['notFound'] = [
			'#type' => 'details',
			'#title' => $this->t('Not found translations'),
		];
		$form['notFound']['explanation'] = [
			'#type' => 'text_format',
			'#title' => $this->t('Not found page text'),
			'#default_value' => $config->get('notFound.explanation')['value'],
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
		#dump($form_state->cleanValues()->getValues());
		foreach ($form_state->cleanValues()->getValues() as $key => $value){
			foreach($value as $value_key => $child_val){
				if(!is_array($child_val)){
					$config->set($key.".".$value_key, $child_val);
				}
			}
		}
		#die();
		$config->save();
  }

}
