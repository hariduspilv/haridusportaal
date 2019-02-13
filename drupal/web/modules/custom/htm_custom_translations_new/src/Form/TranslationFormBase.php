<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Config\Config;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Drupal\htm_custom_translations_new\translationHelper;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class TranslationFormBase.
 */
abstract class TranslationFormBase extends ConfigFormBase {
	/**
	 * The Messenger service.
	 *
	 * @var \Drupal\Core\Messenger\MessengerInterface
	 */
	protected $messenger;

	/**
	 * The language manager.
	 *
	 * @var \Drupal\Core\Language\LanguageManagerInterface $language_manager
	 */
	protected $languageManager;

	/**
	 * TranslationFormBase constructor.
	 *
	 * @param \Drupal\Core\Messenger\MessengerInterface $messenger
	 *   The messenger service.
	 */
	public function __construct(MessengerInterface $messenger, LanguageManagerInterface $language_manager) {
		$this->messenger = $messenger;
		$this->languageManager = $language_manager;
		$this->keyformatter = new translationHelper();
	}

	/**
	 * @param ContainerInterface $container
	 * @return ConfigFormBase|TranslationFormBase
	 */
	public static function create(ContainerInterface $container)
	{
		return new static(
				$container->get('messenger'),
				$container->get('language_manager')
		);
	}

	/**
	 * @return mixed
	 */
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

	/**
	 * @param array              $form
	 * @param FormStateInterface $form_state
	 * @param Config             $config
	 * @param                    $translation_key
	 * @return mixed
	 */
	abstract public function buildFormData(array &$form, FormStateInterface $form_state, Config $config, $translation_key);

	/**
	 * {@inheritdoc}
	 */
	public function validateForm(array &$form, FormStateInterface $form_state) {

		parent::validateForm($form, $form_state);
	}


	/**
	 * @param array              $form
	 * @param FormStateInterface $form_state
	 */
	public function submitForm(array &$form, FormStateInterface $form_state) {
		$redirect = FALSE;

		$config_key = 'htm_custom_translations_new.translation';

		switch ($this->actionType()){
			case 'add':
			case 'edit':
			$translation = $form_state->getValues()['translation'];
			$translation_key = $translation['key'];
			$translation_type = $form_state->getValues()['translation']['translation_type'];

			if($form_state->get('delete_old_key')){
					$translationKeyDefaultValue = $form['translation']['key']['#default_value'];
					$this->config($config_key)->clear($translationKeyDefaultValue);
					$redirect = TRUE;
				}
				$this->config($config_key)->set("$translation_key.translation_type", $translation_type);
				foreach($translation['translations'] as $key => $value){
					$this->config($config_key)->set("$translation_key.$key", $value)->save();
				}

				$message = ($this->actionType() === 'add') ? $this->t('Translation saved') : $this->t('Translation updated');
				$this->messenger->addMessage($message);
				if($redirect){
					$form_state->setRedirect('htm_custom_translations_new.edit_translation', ['type'=> 'edit', 'translation_key' => $translation_key]);
				}
				break;
			case 'import':
				#$this->config($config_key)->delete();
				$json = json_decode(file_get_contents($form_state->getValue('upload')), true);
				$flatten = $this->keyformatter->flattenImportJson($json);

				$result = array_map(function($v){
					if((preg_match("/<[^<]+>/",$v['et'],$m))){
						$elem = [
								'translation_type' => 'text_format',
								'et' => ['format' => 'custom_editor', 'value' => (isset($v['et'])) ? $v['et'] : '' ],
								'en' => ['format' => 'custom_editor', 'value' => (isset($v['en'])) ? $v['en'] : ''],
						];
					}else{
						$elem = [
								'translation_type' => 'textarea',
								'et' => (isset($v['et'])) ? $v['et'] : '',
								'en' => (isset($v['en'])) ? $v['en'] : '',
						];
					}
					return $elem;
				}, $flatten);

				foreach($result as $key => $value){
					$this->config($config_key)->set($key, $value)->save();
				}

				break;
			default:
				$this->messenger->addError('Action type not recognized');
				break;
		}
	}
	protected function SaveConfig(){

	}
}
