<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Config\Config;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageManager;

/**
 * Class TranslationFormAddTranslation.
 */
class TranslationFormAddTranslation extends TranslationFormBase {
	function actionType()
	{
		return 'add';
	}


	public function buildFormData(array &$form, FormStateInterface $form_state, Config $config, $translation_key)
	{

		$form['translation']['key'] = [
			'#type' => 'textfield',
			'#title' => $this->t('Translation key'),
			'#description' => $this->t('Translation key (use .)'),
			'#default_value' => ($translation_key) ? $this->keyformatter->parseSlash($translation_key) : '',
			'#required' => TRUE,
			'#attributes' => [
					'readonly' => ($translation_key) ? true : false
			],
		];

		$form['translation']['translation_type'] = [
			'#type' => 'select',
			'#title' => $this->t('Translation type'),
			'#required' => TRUE,
			'#options' => [
				'textarea' => 'Plain text',
				'text_format' => 'HTML'
			],
			'#ajax' => [
				'callback' => '::ajaxCallback',
				'wrapper' => 'translations-wrapper',
				'method' => 'replace'
			]
		];
		$form['translation']['translations'] = [
			'#prefix' => '<div id="translations-wrapper">',
			'#suffix' => '</div>'
		];


		$languages = \Drupal::languageManager()->getLanguages();
		$format = (isset($form_state->getValues()['translation'])) ? $form_state->getValues()['translation']['translation_type'] : NULL;
		#dump($format);
		if(isset($format)){
			$form['translation']['translations'] = [
				'#type' => 'details',
				'#title' => $this->t('Translations'),
				'#open' => TRUE,
				'#prefix' => '<div id="translations-wrapper">',
				'#suffix' => '</div>'
			];
			foreach ($languages as $lang_key => $language){
				$form['translation']['translations'][$lang_key] = [
					'#type' => $format,
					'#title' => $this->t('Translation in ' . $language->getName()),
				];
			}
		}

	}

	public function ajaxCallback(array &$form, FormStateInterface $form_state) {
		return $form['translation']['translations'];
	}



}
