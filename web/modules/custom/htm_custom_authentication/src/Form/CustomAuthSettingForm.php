<?php

namespace Drupal\htm_custom_authentication\Form;

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


        $form['auth_methods'] = [
            '#type' => 'fieldset',
            '#title' => $this->t('Authentication methods')
        ];

        $form['auth_methods']['harid'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('HarID'),
            '#default_value' => $config->get('auth_methods.harid'),
        ];

        $form['auth_methods']['tara'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('TARA'),
            '#default_value' => $config->get('auth_methods.tara'),
        ];

        $form['auth_methods']['mobile_id'] = [
            '#type' => 'checkbox',
            '#title' => $this->t('Mobile-ID'),
            '#default_value' => $config->get('auth_methods.mobile_id'),
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

        $this->config('htm_custom_authentication.customauthsetting')
            ->set('auth_methods.harid', $form_state->getValue('harid'))
            ->set('auth_methods.tara', $form_state->getValue('tara'))
            ->set('auth_methods.mobile_id', $form_state->getValue('mobile_id'))
            ->save();
    }

}
