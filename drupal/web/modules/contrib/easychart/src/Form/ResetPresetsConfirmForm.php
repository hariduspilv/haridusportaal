<?php

/**
 * @file
 * Contains \Drupal\easychart\ResetPresetsConfirmForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class ResetPresetsConfirmForm extends ConfirmFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_reset_presets_confirm_form';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Are you sure you want to reset the presets to their default values ?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('easychart.presets');
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->configFactory()->getEditable('easychart.settings')
      ->clear('presets')
      ->save();
    drupal_set_message($this->t('The presets have been reset to their default values.'));
    $form_state->setRedirectUrl($this->getCancelUrl());
  }
}
