<?php

namespace Drupal\purge_processor_test\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\purge_ui\Form\ProcessorConfigFormBase;

/**
 * Configuration form for a test processor.
 *
 * @see \Drupal\purge_processor_test\Plugin\Purge\Processor\WithFormProcessor.
 */
class ProcessorConfigForm extends ProcessorConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'purge_processor_test.configform';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['textfield'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Test'),
      '#required' => FALSE,
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitFormSuccess(array &$form, FormStateInterface $form_state) {
    // Nothing to do here.
  }

}
