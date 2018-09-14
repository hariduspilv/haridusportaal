<?php

/**
 * @file
 * Contains \Drupal\easychart\Form\PresetsForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\ConfigFormBase;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Form\FormStateInterface;

class PresetsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_admin_presets_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'easychart.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, Request $request = NULL) {
    $config = $this->config('easychart.settings');

    $form['presets'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Presets'),
      '#title_display' => 'invisible',
      '#default_value' => $config->get('presets'),
      '#description' => $this->t('Presets for every Easychart chart. If these preset are also mentioned in the available options, they will be shown, but not editable.'),
      '#attributes' => array('class' => array('easychart-presets')),
      '#rows' => 30,
    ];

    $form['actions']['reset'] = [
      '#type' => 'submit',
      '#value' => $this->t('Reset to defaults'),
      '#submit' => array('::resetForm'),
      '#limit_validation_errors' => array(),
      '#weight' => 100,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $this->config('easychart.settings')
      ->set('presets', $values['presets'])
      ->save();
  }

  /**
   * Redirect to reset form.
   *
   * @param array $form
   *   The form.
   * @param FormStateInterface $form_state
   *   The form state.
   */
  public function resetForm(array &$form, FormStateInterface $form_state) {
    $form_state->setRedirect('easychart.reset_presets_confirm_form');
  }
}
