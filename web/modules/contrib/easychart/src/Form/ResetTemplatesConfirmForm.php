<?php

/**
 * @file
 * Contains \Drupal\easychart\ResetTemplatesConfirmForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class ResetTemplatesConfirmForm extends ConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_reset_templates_confirm_form';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to reset the templates to their default values ?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('easychart.templates');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->configFactory()->getEditable('easychart.settings')
      ->clear('templates')
      ->save();
    drupal_set_message($this->t('The templates have been reset to their default values.'));
    $form_state->setRedirectUrl($this->getCancelUrl());
  }
}
