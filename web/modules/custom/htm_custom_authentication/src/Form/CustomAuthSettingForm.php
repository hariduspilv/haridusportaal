<?php

namespace Drupal\htm_custom_authentication\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class CustomAuthSettingForm.
 */
class CustomAuthSettingForm extends ConfigFormBase {

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames() {
        return [
            'htm_custom_authentication.customauthsetting',
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'custom_auth_setting_form';
    }


    /**
     * @param array              $form
     * @param FormStateInterface $form_state
     * @return array
     */
    public function buildForm(array $form, FormStateInterface $form_state) {
        $form = parent::buildForm($form, $form_state);
        $config = $this->config('htm_custom_authentication.customauthsetting');

        $form['tabs'] = [
            '#type' => 'vertical_tabs',
        ];
        $state = \Drupal::state();
        $form['auth_methods'] = [
            '#type' => 'fieldset',
            '#title' => $this->t('Authentication methods')
        ];

      $state_default = $state->get('auth_methods.harid');
        $form['auth_methods']['harid'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('HarID'),
            '#default_value' => $state_default,
        ];

      $state_default = $state->get('auth_methods.tara');
        $form['auth_methods']['tara'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('TARA'),
            '#default_value' => $state_default,
        ];

      $state_default = $state->get('auth_methods.mobile_id');
        $form['auth_methods']['mobile_id'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('Mobile-ID'),
            '#default_value' => $state_default,
        ];

        return $form;
    }


    /**
     * @param array              $form
     * @param FormStateInterface $form_state
     */
    public function validateForm(array &$form, FormStateInterface $form_state) {
        parent::validateForm($form, $form_state);
    }


    /**
     * @param array              $form
     * @param FormStateInterface $form_state
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        parent::submitForm($form, $form_state);
        $state = \Drupal::state();

       $state  ->set('auth_methods.harid', $form_state->getValue('harid'));
       $state ->set('auth_methods.tara', $form_state->getValue('tara'));
       $state ->set('auth_methods.mobile_id', $form_state->getValue('mobile_id'));
        Cache::invalidateTags(['config:htm_custom_authentication.customauthsetting']);
    }

}
