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
	 * @param array              $form
	 * @param FormStateInterface $form_state
	 * @return array
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

    $form['email_subscription'] = [
      '#type' => 'details',
      '#title' => $this->t('Subscription emails'),
      '#description' => $this->t('Subscription email settings'),
      '#group' => 'emails',
    ];
    $form['email_subscription']['token_tree'] = [
      '#theme' => 'token_tree_link',
      '#token_types' => array('subscription_entity'),
      '#show_restricted' => TRUE,
      '#global_types' => FALSE,
      '#weight' => 90,
    ];
    $form['email_subscription']['fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Subscription create confirmation')
    ];
    $form['email_subscription']['fieldset']['email_subscription_create_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('emails.email_subscription.create_email_subject'),
      '#maxlength' => 180,
    ];
    $form['email_subscription']['fieldset']['email_subscription_create_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('emails.email_subscription.create_email_body'),
    ];

    $form['email_subscription']['fieldset2'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Subscription update confirmation')
    ];
    $form['email_subscription']['fieldset2']['email_subscription_update_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('emails.email_subscription.update_email_subject'),
      '#maxlength' => 180,
    ];
    $form['email_subscription']['fieldset2']['email_subscription_update_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('emails.email_subscription.update_email_body'),
    ];

    $form['email_subscription']['fieldset3'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Subscription notification confirmation')
    ];
    $form['email_subscription']['fieldset3']['email_subscription_notify_subject'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Subject'),
      '#default_value' => $config->get('emails.email_subscription.notify_email_subject'),
      '#maxlength' => 180,
    ];
    $form['email_subscription']['fieldset3']['email_subscription_notify_body'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Body'),
      '#default_value' => $config->get('emails.email_subscription.notify_email_body'),
    ];

    /* Event emails ------------------------------------------------------------- */
    $form['email_event_registration'] = [
      '#type' => 'details',
      '#title' => $this->t('Event emails'),
      '#description' => $this->t('Event registration email settings'),
      '#group' => 'emails',
    ];

    /* Do we need this? */
    $form['email_event_registration']['token_tree'] = [
      '#theme' => 'token_tree_link',
      '#token_types' => array('event_reg_entity', 'htm_custom_event_tokens'),
      '#show_restricted' => TRUE,
      '#global_types' => FALSE,
      '#weight' => 90,
    ];

    $form['email_event_registration']['fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Event registration confirmation')
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
      '#title' => $this->t('Event organizer notice')
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


    $form['general'] = [
      '#type' => 'details',
      '#title' => $this
      ->t('General settings'),
      '#group' => 'tabs',
      '#weight' => -1
    ];
    $form['general']['fe_url'] = [
      '#type' => 'url',
      '#title' => $this->t('Front-end location'),
      '#default_value' => $config->get('general.fe_url'),
      '#maxlength' => 255,
      '#size' => 30,
    ];

    return $form;
  }


	/**
	 * @param array              $form
	 * @param FormStateInterface $form_state
	 */
	public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }


	/**
	 * @param array              $form
	 * @param FormStateInterface $form_state
	 */
	public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);

    $this->config('htm_custom_admin_form.customadmin')
    ->set('emails.email_event_registration.registration_email_subject', $form_state->getValue('email_event_registration_subject'))
    ->set('emails.email_event_registration.registration_email_body', $form_state->getValue('email_event_registration_body'))
    ->set('emails.email_event_registration.organizer_email_subject', $form_state->getValue('email_event_notice_subject'))
    ->set('emails.email_event_registration.organizer_email_body', $form_state->getValue('email_event_notice_body'))
    ->set('emails.email_subscription.create_email_subject', $form_state->getValue('email_subscription_create_subject'))
    ->set('emails.email_subscription.create_email_body', $form_state->getValue('email_subscription_create_body'))
    ->set('emails.email_subscription.update_email_subject', $form_state->getValue('email_subscription_update_subject'))
    ->set('emails.email_subscription.update_email_body', $form_state->getValue('email_subscription_update_body'))
    ->set('emails.email_subscription.notify_email_subject', $form_state->getValue('email_subscription_notify_subject'))
    ->set('emails.email_subscription.notify_email_body', $form_state->getValue('email_subscription_notify_body'))

    ->set('general.fe_url', $form_state->getValue('fe_url'))
    ->save();
  }

}
