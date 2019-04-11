<?php

namespace Drupal\content_sync\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

class ContentSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'content_admin_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    $config = $this->config('content_sync.settings');

    $form['site_uuid_override'] = array(
      '#type' => 'checkbox',
      '#title' => $this->t('Bypass site UUID validation'),
      '#description' => $this->t('If checked, site UUID validation would be ignored allowing to import the staged content even if it originates from a different site than this site.'),
      '#default_value' => $config->get('content_sync.site_uuid_override'),
    );
    $form['help_menu_disabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Disable help menu'),
      '#description' => $this->t("If checked, 'How can we help you?' menu will be disabled."),
      '#return_value' => TRUE,
      '#default_value' => $config->get('content_sync.help_menu_disabled'),
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('content_sync.settings');
    $config->set('content_sync.site_uuid_override', $form_state->getValue('site_uuid_override'));
    $config->set('content_sync.help_menu_disabled', $form_state->getValue('help_menu_disabled'));

    $config->save();
    return parent::submitForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'content_sync.settings',
    ];
  }

}