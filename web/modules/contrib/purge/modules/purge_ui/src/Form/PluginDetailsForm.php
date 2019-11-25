<?php

namespace Drupal\purge_ui\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Render plugin details.
 */
class PluginDetailsForm extends FormBase {
  use CloseDialogTrait;

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
    return 'purge_ui.plugin_details_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['description'] = [
      '#prefix' => '<h3>',
      '#markup' => $form_state->getBuildInfo()['args'][0]['details'],
      '#suffix' => '</h3>',
    ];

    // Set dialog code and add the close button.
    $form['#attached']['library'][] = 'core/drupal.dialog.ajax';
    $form['actions'] = ['#type' => 'actions'];
    $form['actions']['close'] = [
      '#type' => 'submit',
      '#button_type' => 'primary',
      '#value' => $this->t('Close'),
      '#weight' => -10,
      '#ajax' => ['callback' => '::closeDialog'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {}

}
