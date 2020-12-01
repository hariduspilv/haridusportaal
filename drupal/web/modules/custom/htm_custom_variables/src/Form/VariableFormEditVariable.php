<?php

namespace Drupal\htm_custom_variables\Form;

use Drupal\Core\Config\Config;
use Drupal\Core\Form\FormStateInterface;
use Drupal\htm_custom_variables\Form\VariableFormAddVariable;

/**
 * Class VariableFormEditVariable.
 */
class VariableFormEditVariable extends VariableFormAddVariable {
	function actionType()
	{
		return 'edit';
	}

	public function buildFormData(array &$form, FormStateInterface $form_state, Config $config, $variable_key)
	{
		parent::buildFormData($form, $form_state, $config, $variable_key);
		$current_value = $config->get($variable_key);
		#dump($current_conf);
		$form['variable']['key'] += [
			'#default_value' => $variable_key,
			#'#attributes' => ['disabled' => 'disabled']
		];

        $form['variable']['variables'] = [
            '#default_value' => $current_value,
            '#type' => 'textarea',
            '#title' => $this->t('Value'),
        ];
	}

	public function validateForm(array &$form, FormStateInterface $form_state)
	{
		$variableKeyDefaultValue = $form['variable']['key']['#default_value'];
		$variableKeyFormStateValue = $form_state->getValue(['variable','key']);
		if (strcmp($variableKeyDefaultValue, $variableKeyFormStateValue) !== 0) {
			$form_state->set('delete_old_key', TRUE);
		}
		#parent::validateForm($form, $form_state); // TODO: Change the autogenerated stub
	}


}