<?php

namespace Drupal\htm_custom_variables\Form;

use Drupal\Core\Config\Config;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class VariableFormAddVariable.
 */
class VariableFormAddVariable extends VariableFormBase {
    function actionType()
    {
        return 'add';
    }


    public function buildFormData(array &$form, FormStateInterface $form_state, Config $config, $variable_key)
    {

        $form['variable']['key'] = [
            '#type' => 'textfield',
            '#title' => $this->t('Variable key'),
            '#description' => $this->t('Variable key (use .)'),
            '#required' => TRUE,
        ];

        $form['variable']['variables'] = [
            '#type' => 'textarea',
            '#title' => $this->t('Value'),
        ];

    }

}
