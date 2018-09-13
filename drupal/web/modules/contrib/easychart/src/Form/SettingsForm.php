<?php

/**
 * @file
 * Contains \Drupal\easychart\Form\SettingsForm
 */

namespace Drupal\easychart\Form;

use Drupal\Core\Form\ConfigFormBase;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class SettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'easychart_admin_settings_form';
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

    $options = [3600, 10800, 21600, 43200, 86400, 604800];

    $form['url_update_frequency'] = [
      '#type' => 'select',
      '#options' => [0 => $this->t('Never')] + array_map([\Drupal::service('date.formatter'), 'formatInterval'], array_combine($options, $options)),
      '#title' => $this->t('External data update interval'),
      '#description' => $this->t('Data from external csv files are cached for performance reasons. Decide how often this data should be refreshed.'),
      '#default_value' => $config->get('url_update_frequency'),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $values = $form_state->getValues();
    $this->config('easychart.settings')
      ->set('url_update_frequency', $values['url_update_frequency'])
      ->save();
  }

}
