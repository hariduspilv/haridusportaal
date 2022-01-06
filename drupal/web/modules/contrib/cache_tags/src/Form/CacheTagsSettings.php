<?php

namespace Drupal\cache_tags\Form;

/**
 * @file
 * Contains \Drupal\cache_tags\Form\CacheTagsSettings.
 */

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\ConfigFormBase;

/**
 * Configure site information settings for this site.
 */
class CacheTagsSettings extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'cache_tags_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['cache_tags.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('cache_tags.settings');

    $form['intro'] = [
      '#markup' => t('Configure your settings for the Cache-Tags header.'),
    ];

    $form['CacheTagsName'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Cache-Tags Name'),
      '#default_value' => !empty($config->get('CacheTagsName')) ? $config->get('CacheTagsName') : 'Cache-Tags',
      '#description'   => $this->t('Name your Cache-Tags header. Default is Cache-Tags, Key CD:n uses Cache-Tag.'),
      '#attributes'    => [
        'placeholder' => 'Example: Cache-Tags',
      ],
    ];

    $form['Delimiter'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Delimiter'),
      '#default_value' => !empty($config->get('Delimiter')) ? $config->get('Delimiter') : '[space]',
      '#description'   => $this->t('Accepted values are [space] and [comma], that could be combined. Default is [space], for Cloudflare [comma].'),
      '#attributes'    => [
        'placeholder' => 'Example: [space][comma]',
      ],
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // @todo
    // Validations.
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('cache_tags.settings');
    // Save settings.
    $config->set('CacheTagsName', $form_state->getValue('CacheTagsName'));
    $config->set('Delimiter', $form_state->getValue('Delimiter'));
    $config->save();
    // Clear Drupal cache.
    drupal_flush_all_caches();
    return parent::submitForm($form, $form_state);
  }

}
