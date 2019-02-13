<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_translations_new\variableHelper;

/**
 * Class VariableFormList.
 */
class TranslationFormList extends ConfigFormBase {
	public function __construct(ConfigFactoryInterface $config_factory)
	{
		parent::__construct($config_factory);
		$this->formatter = new variableHelper();
	}

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
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('htm_custom_translations_new.translation');
		$config_values = $config->get();

    $header = [
    	'key' => $this->t('Translation key'),
			'translation_languages' => $this->t('Languages'),
			'translation_value' => $this->t('Translation'),
			'operations' => $this->t('Operations'),
		];

		$form['table'] = [
			'#type' => 'table',
			'#header' => $header,
			'#empty' => t('No translations found. <a href="@add-url">Add translation.</a>', [
					'@add-url' => Url::fromRoute('htm_custom_translations_new.add_translation')->toString(),
			]),
		];

		$languages = \Drupal::languageManager()->getLanguages();
		$mapped_config = $this->formatter->flatten($config_values);
    foreach($mapped_config as $key => $data){

	    if($key === 'langcode') continue;

			$form['table'][$key]['key'] = [
				'#plain_text' => $key,
			];
			foreach($languages as $lang_key => $value){
				$form['table'][$key]['translation_languages'][] = [
					'#type' => 'item',
					'#title' => $lang_key,
				];
				$translation_value = (is_array($data[$lang_key]))? $data[$lang_key]['value'] : $data[$lang_key];
				$form['table'][$key]['translation_value'][] = [
					'#type' => 'item',
					'#title' => ($translation_value) ? $translation_value : 'MISSING',
				];
			}

			$form['table'][$key]['operations'] = [
				'#type' => 'operations',
				'#links' => []
			];
			$form['table'][$key]['operations']['#links']['edit'] = [
				'title' => $this->t('Edit'),
				'url' => Url::fromRoute('htm_custom_translations_new.edit_translation', ['translation_key' => $key]),
			];
			$form['table'][$key]['operations']['#links']['delete'] = [
				'title' => $this->t('Delete'),
				'url' => Url::fromRoute('htm_custom_translations_new.delete_translation', ['translation_key' => $key]),
			];

		}
    return $form;
  }




}
