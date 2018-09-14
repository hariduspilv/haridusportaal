<?php

/**
 * @file
 * Contains \Drupal\easychart\Form\TemplatesForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\ConfigFormBase;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Form\FormStateInterface;

class TemplatesForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_admin_templates_form';
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

    $form['#attached']['library'][] = 'easychart/easychart.admin';
    $form['#attached']['library'][] = 'easychart/lib.easycharts.full';
    $form['#attached']['library'][] = 'easychart/lib.highcharts';

    $form['templates'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Templates'),
      '#title_display' => 'invisible',
      '#default_value' => $config->get('templates'),
      '#description' => $this->t("These templates will be selectable in the Easychart interface when creating/editing a chart."),
      '#attributes' => array('class' => array('easychart-templates')),
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
      ->set('templates', $values['templates'])
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
    $form_state->setRedirect('easychart.reset_templates_confirm_form');
  }
}
