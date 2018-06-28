<?php

namespace Drupal\htm_custom_admin_form\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class CustomAdminForm.
 */
class CustomAdminForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'htm_custom_admin_form.customadmin',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'custom_admin_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
		$form = parent::buildForm($form, $form_state);
    $config = $this->config('htm_custom_admin_form.customadmin');

		$form['tabs'] = [
			'#type' => 'vertical_tabs',
			#'#default_tab' => 'edit-email',
		];

		$form['emails'] = [
			'#type' => 'details',
			'#title' => $this->t('Emails'),
			'#description' => $this->t('Description text here!'),
			'#group' => 'tabs',
		];

		/* Do we need this? */
		$form['emails']['token_tree'] = [
			'#theme' => 'token_tree_link',
			'#token_types' => array('event_reg_entity'),
			'#show_restricted' => TRUE,
			'#global_types' => FALSE,
			'#weight' => 90,
		];


		$form['email_event_registration'] = [
			'#type' => 'details',
			'#title' => $this->t('Event registration email'),
			'#description' => $this->t('Event registration email settings'),
			'#group' => 'emails',
		];

		$form['email_event_registration']['fieldset'] = [
			'#type' => 'fieldset',
			'#title' => 'Event registration confirmation'
		];
		$form['email_event_registration']['fieldset']['email_event_registration_subject'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Subject'),
			'#default_value' => $config->get('emails.email_event_registration.registration_email_subject'),
			'#maxlength' => 180,
		];
		$form['email_event_registration']['fieldset']['email_event_registration_body'] = [
			'#type' => 'textarea',
			'#title' => $this->t('Body'),
			'#default_value' => $config->get('emails.email_event_registration.registration_email_body'),
		];

		$form['email_event_registration']['fieldset_2'] = [
			'#type' => 'fieldset',
			'#title' => 'Event organizer notice'
		];
		$form['email_event_registration']['fieldset_2']['email_event_notice_subject'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Subject'),
			'#default_value' => $config->get('emails.email_event_registration.organizer_email_subject'),
			'#maxlength' => 180,
		];
		$form['email_event_registration']['fieldset_2']['email_event_notice_body'] = [
			'#type' => 'textarea',
			'#title' => $this->t('Body'),
			'#default_value' => $config->get('emails.email_event_registration.organizer_email_body'),
		];





		$form['other_settings'] = array(
			'#type' => 'details',
			'#title' => $this
					->t('Some other things here'),
			'#group' => 'tabs',
		);
		$form['other_settings']['example'] = array(
			'#type' => 'textfield',
			'#title' => $this
					->t('Example'),
		);
    return $form;
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
    $this->config('htm_custom_admin_form.customadmin')
      ->set('emails.email_event_registration.registration_email_subject', $form_state->getValue('email_event_registration_subject'))
      ->set('emails.email_event_registration.registration_email_body', $form_state->getValue('email_event_registration_body'))
			->set('emails.email_event_registration.organizer_email_subject', $form_state->getValue('email_event_notice_subject'))
			->set('emails.email_event_registration.organizer_email_body', $form_state->getValue('email_event_notice_body'))
      ->save();
  }

}
