<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Config\Config;
use Drupal\htm_custom_translations_new\formatKey;

/**
 * Class TranslationFormBase.
 */
abstract class TranslationFormBase extends ConfigFormBase {

	public function __construct(ConfigFactoryInterface $config_factory)
	{
		parent::__construct($config_factory);
		$this->keyformatter = new formatKey();
	}

	abstract function actionType();
	/**
	 * {@inheritdoc}
	 */
	protected function getEditableConfigNames() {
		return [
				'htm_custom_translations_new.translation',
		];
	}

	/**
	 * {@inheritdoc}
	 */
	public function getFormId() {
		return 'translation_form';
	}

	/**
	 * {@inheritdoc}
	 */
	public function buildForm(array $form, FormStateInterface $form_state, $translation_key = NULL) {
		$form['#tree'] = TRUE;

		$config = $this->config('htm_custom_translations_new.translation');
		$this->buildFormData($form, $form_state, $config, $translation_key);

		return parent::buildForm($form, $form_state);

	}

	abstract public function buildFormData(array &$form, FormStateInterface $form_state, Config $config, $translation_key);

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
		switch ($this->actionType()){
			case 'add':
			case 'edit':
				$config_key = 'htm_custom_translations_new.translation';
				$translation = $form_state->getValues()['translation'];
				$translation_key = $this->keyformatter->parseDot($translation['key']);
				$translation_type = $form_state->getValues()['translation']['translation_type'];

				$this->config($config_key)->set("$translation_key.translation_type", $translation_type);
				foreach($translation['translations'] as $key => $value){
					$this->config($config_key)->set("$translation_key.$key", $value)->save();
				}
				break;
		}
	}

}
