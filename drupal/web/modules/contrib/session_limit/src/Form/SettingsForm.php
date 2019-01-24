<?php

namespace Drupal\session_limit\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Render\Element;
use Drupal\session_limit\Services\SessionLimit;

class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'session_limit_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['session_limit.settings'];
  }

  public function buildForm(array $form, FormStateInterface $form_state) {

    $form['session_limit_max'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Default maximum number of active sessions'),
      '#default_value' => \Drupal::config('session_limit.settings')->get('session_limit_max'),
      '#size' => 2,
      '#maxlength' => 3,
      '#description' => $this->t('The maximum number of active sessions a user can have. 0 implies unlimited sessions.'),
    ];

    $form['session_limit_behaviour'] = [
      '#type' => 'radios',
      '#title' => $this->t('When the session limit is exceeded'),
      '#default_value' => \Drupal::config('session_limit.settings')->get('session_limit_behaviour'),
      '#options' => SessionLimit::getActions(),
    ];

    if (\Drupal::moduleHandler()->moduleExists('masquerade')) {
      $form['session_limit_masquerade_ignore'] = [
        '#type' => 'checkbox',
        '#title' => $this->t('Ignore masqueraded sessions.'),
        '#description' => $this->t("When a user administrator uses the masquerade module to impersonate a different user, it won't count against the session limit counter"),
        '#default_value' => \Drupal::config('session_limit.settings')->get('session_limit_masquerade_ignore'),
      ];
    }

    $form['session_limit_logged_out_message_severity'] = [
      '#type' => 'select',
      '#title' => $this->t('Logged out message severity'),
      '#default_value' => \Drupal::config('session_limit.settings')->get('session_limit_logged_out_message_severity'),
      '#options' => [
        'error' => $this->t('Error'),
        'warning' => $this->t('Warning'),
        'status' => $this->t('Status'),
        '_none' => $this->t('No Message'),
      ],
      '#description' => $this->t('The severity of the message the user receives when they are logged out by session limit.'),
    ];

    $role_limits = \Drupal::config('session_limit.settings')->get('session_limit_roles');

    $form['session_limit_roles'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Role limits'),
      '#description' => $this->t('Optionally, specify session limits by role.'),
    ];

    foreach (user_roles(TRUE) as $rid => $role) {
      $form['session_limit_roles'][$rid] = [
        '#type' => 'select',
        '#options' => [
          0 => $this->t('Uses default'),
          SessionLimit::USER_UNLIMITED_SESSIONS => $this->t('No limits'),
          1,
          2,
          3,
          4,
          5,
        ],
        '#title' => $role->label(),
        '#default_value' => empty($role_limits[$rid]) ? 0 : $role_limits[$rid],
      ];
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, \Drupal\Core\Form\FormStateInterface $form_state) {
    $maxsessions = $form_state->getValue(['session_limit_max']);
    if (!is_numeric($maxsessions)) {
      $form_state->setErrorByName('session_limit_max', $this->t('You must enter a number for the maximum number of active sessions'));
    }
    elseif ($maxsessions < 0) {
      $form_state->setErrorByName('session_limit_max', $this->t('Maximum number of active sessions must be positive'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('session_limit.settings');

    $config->set('session_limit_max', $form_state->getValue($form['session_limit_max']['#parents']));
    $config->set('session_limit_behaviour', $form_state->getValue($form['session_limit_behaviour']['#parents']));
    $config->set('session_limit_logged_out_message_severity', $form_state->getValue($form['session_limit_logged_out_message_severity']['#parents']));

    $role_limits = [];
    foreach (user_roles(TRUE) as $rid => $role) {
      $role_limits[$rid] = $form_state->getValue($form['session_limit_roles'][$rid]['#parents']);
    }

    $config->set('session_limit_roles', $role_limits);

    if (!empty($form['session_limit_masquerade_ignore'])) {
      $config->set('session_limit_masquerade_ignore', $form_state->getValue($form['session_limit_masquerade_ignore']['#parents']));
    }

    $config->save();

    if (method_exists($this, '_submitForm')) {
      $this->_submitForm($form, $form_state);
    }

    parent::submitForm($form, $form_state);
  }

}
