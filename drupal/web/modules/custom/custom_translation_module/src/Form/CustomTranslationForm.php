<?php

namespace Drupal\custom_translation_module\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class CustomTranslationForm.
 */
class CustomTranslationForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'custom_translation_module.settings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'custom_translation_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('custom_translation_module.settings');
    $form['field1'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Field1'),
      '#description' => $this->t('Textfield 1'),
      '#maxlength' => 64,
      '#size' => 64,
      '#default_value' => $config->get('field1'),
    ];

		$form['field2'] = [
			'#type' => 'textfield',
			'#title' => $this->t('field2'),
			'#description' => $this->t('Textfield 2'),
			'#maxlength' => 64,
			'#size' => 64,
			'#default_value' => $config->get('field2'),
		];

		$form['field3'] = [
				'#type' => 'textfield',
				'#title' => $this->t('field2'),
				'#description' => $this->t('Textfield 2'),
				'#maxlength' => 64,
				'#size' => 64,
				'#default_value' => $config->get('field3'),
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
		$config = $this->config('custom_translation_module.settings');
		//kint($config);
		//die();


		foreach ($form_state->cleanValues()->getValues() as $key => $value){
			$config->set($key, $value);
		}
		//die();
		$config->save();
  }

}
