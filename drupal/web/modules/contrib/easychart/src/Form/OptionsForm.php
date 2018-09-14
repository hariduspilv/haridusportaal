<?php

/**
 * @file
 * Contains \Drupal\easychart\Form\OptionsForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\FormBase;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class OptionsForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_admin_options_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, Request $request = NULL) {

    $form['#attached']['library'][] = 'easychart/easychart.admin';
    $form['#attached']['library'][] = 'easychart/lib.easycharts.full';
    $form['#attached']['library'][] = 'easychart/lib.highcharts';

    $default_options = '';
    if (file_exists('public://easychart-options.json')) {
      $default_options = file_get_contents('public://easychart-options.json');
    }

    $form['options'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Available options'),
      '#title_display' => 'invisible',
      '#description' => $this->t('These Highcharts options will be configurable in the Easychart interface when creating/editing a chart. See <a href="@url" target="_blank">http://api.highcharts.com/highcharts</a> for all available options.', array('@url' => Url::fromUri('http://api.highcharts.com/highcharts')->toUriString())),
      '#default_value' => $default_options,
      '#attributes' => array('class' => array('easychart-options')),
      '#rows' => 15,
    ];

    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save configuration'),
      '#submit' => array('::submitForm'),
      '#button_type' => 'primary',
    ];

    $form['actions']['reset'] = [
      '#type' => 'submit',
      '#value' => $this->t('Reset to defaults'),
      '#submit' => array('::resetForm'),
      '#limit_validation_errors' => array(),
      '#weight' => 100,
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Merge options with dump.xml
    $current_options = json_decode($form_state->getValue('options'));

    // Get all options.
    $full_options = json_decode(file_get_contents(DRUPAL_ROOT . '/libraries/easychart/src/js/config/dump.json'), TRUE);
    $all_options = array();
    foreach ($full_options as $key => $value) {
      $all_options[$value['fullname']] = $value;
    }

    // Start iterating and find the panes.
    if (!empty($current_options)) {
      foreach ($current_options as $key => $info) {
        if (isset($info->panes)) {
          foreach ($info->panes as $s_key => $s_value) {
            if (isset($s_value->options)) {
              foreach ($s_value->options as $ss_key => $ss_value) {
                if ($ss_value->fullname) {
                  $current_options[$key]->panes[$s_key]->options[$ss_key] = (object) array_merge((array) $ss_value, $all_options[$ss_value->fullname]);
                }
              }
            }
          }
        }
      }

      // Write to file.
      file_unmanaged_save_data(json_encode($current_options), 'public://easychart-options.json', FILE_EXISTS_REPLACE);
      drupal_set_message($this->t('The configuration options have been saved.'));
    }
    else {
      drupal_set_message($this->t('Something went wrong saving the options.'));
    }
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
    $form_state->setRedirect('easychart.reset_options_confirm_form');
  }
}
