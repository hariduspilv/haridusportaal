<?php

namespace Drupal\structure_sync\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Import and export form for content in structure, like taxonomy terms.
 */
class StructureSyncForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'structure_sync';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'structure_sync.data',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['title'] = [
      '#type' => 'page_title',
      '#title' => $this->t('General settings'),
    ];

    $log = $this->config('structure_sync.data')->get('log');

    if ($log === NULL) {
      $log = TRUE;
    }

    $form['options'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Options'),
    ];

    $form['options']['log'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Enable logging'),
      '#default_value' => $log,
    ];

    $form['submit'] = [
      '#type' => 'submit',
      '#button_type' => 'primary',
      '#value' => $this->t('Save'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('structure_sync.data')
      ->set('log', $form_state->getValue('log'))
      ->save();
  }

}
