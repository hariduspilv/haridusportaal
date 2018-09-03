<?php

/**
 * @file
 * Contains \Drupal\memcache_admin\Form\MemcacheAdminSettingsForm.
 */

namespace Drupal\memcache_admin\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Memcache admin settings form.
 */
class MemcacheAdminSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'memcache_admin_admin_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['show_memcache_statistics'] = [
      '#type'          => 'checkbox',
      '#title'         => t('Show memcache statistics at the bottom of each page'),
      '#default_value' => \Drupal::config('memcache_admin.settings')->get('show_memcache_statistics'),
      '#description'   => t("These statistics will be visible to users with the 'access memcache statistics' permission."),
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function getEditableConfigNames() {
    return ['memcache_admin.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('memcache_admin.settings')
      ->set('show_memcache_statistics', $form_state->getValue('show_memcache_statistics'))
      ->save();

    parent::submitForm($form, $form_state);
  }
}
