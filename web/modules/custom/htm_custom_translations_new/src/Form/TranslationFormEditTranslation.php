<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class TranslationFormEditTranslation.
 */
class TranslationFormEditTranslation extends ConfigFormBase {

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
		#dump($translation_key);
		$config = $this->config('htm_custom_translations_new.translation');
		$form['label'] = [
				'#type' => 'textfield',
				'#title' => $this->t('Key'),
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

		$this->config('htm_custom_translations_new.translation')
				->set('text', $form_state->getValue('text'))
				->save();
	}

}
