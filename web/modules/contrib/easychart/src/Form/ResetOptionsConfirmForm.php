<?php

/**
 * @file
 * Contains \Drupal\easychart\ResetOptionsConfirmForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class ResetOptionsConfirmForm extends ConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_reset_options_confirm_form';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to reset the options to their default values ?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('easychart.options');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    file_unmanaged_delete('public://easychart-options.json');
    drupal_set_message($this->t('The options have been reset to their default values.'));
    $form_state->setRedirectUrl($this->getCancelUrl());
  }
}
