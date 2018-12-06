<?php

namespace Drupal\htm_custom_varnish_purge\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class VarnishPurgeForm.
 */
class VarnishPurgeForm extends ConfigFormBase {

    /**
     * {@inheritdoc}
     */
    protected function getEditableConfigNames() {
        return [
            'htm_custom_varnish_purge.varnishpurge',
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function getFormId() {
        return 'varnish_purge_form';
    }

    /**
     * {@inheritdoc}
     */
    public function buildForm(array $form, FormStateInterface $form_state) {
        $config = $this->config('htm_custom_varnish_purge.varnishpurge');

        $form['varnish_data'] = [
            '#type' => 'fieldset',
            '#title' => $this->t('Varnish data'),
        ];

        $form['varnish_data']['path'] = [
            '#title' => $this->t('Varnish path'),
            '#type' => 'textfield',
            '#placeholder' => $this->t("Enter path for Varnish."),
            '#default_value' => $config->get('path'),
            '#maxlength' => 100,
        ];

        $form['varnish_data']['port'] = [
            '#title' => $this->t('Varnish port'),
            '#type' => 'number',
            '#placeholder' => $this->t("Enter port for Varnish."),
            '#default_value' => $config->get('port'),
            '#min' => 0
        ];

        $form['varnish_data']['header_name'] = [
            '#title' => $this->t('Cache header name'),
            '#type' => 'textfield',
            '#placeholder' => $this->t("Enter name for cache header."),
            '#default_value' => $config->get('header_name'),
            '#maxlength' => 100,
        ];
        return parent::buildForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    public function validateForm(array &$form, FormStateInterface $form_state) {
        parent::validateForm($form, $form_state);
    }

    /**
     * {@inheritdoc}
     */
    public function submitForm(array &$form, FormStateInterface $form_state) {
        parent::submitForm($form, $form_state);

        $this->config('htm_custom_varnish_purge.varnishpurge')
            ->set('path', $form_state->getValue('path'))
            ->set('port', $form_state->getValue('port'))
            ->set('header_name', $form_state->getValue('header_name'))
            ->save();
    }

}
