<?php

namespace Drupal\htm_custom_translations_new\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class TranslationFormDeleteTranslation.
 */
class TranslationFormDeleteTranslation extends ConfigFormBase {

	/**
	 * The Messenger service.
	 *
	 * @var \Drupal\Core\Messenger\MessengerInterface
	 */
	protected $messenger;

	/**
	 * TranslationFormBase constructor.
	 *
	 * @param \Drupal\Core\Messenger\MessengerInterface $messenger
	 *   The messenger service.
	 */
	public function __construct(MessengerInterface $messenger) {
		$this->messenger = $messenger;
	}

	/**
	 * @param ContainerInterface $container
	 * @return ConfigFormBase|TranslationFormBase
	 */
	public static function create(ContainerInterface $container)
	{
		return new static(
			$container->get('messenger')
		);
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
	public function buildForm(array $form, FormStateInterface $form_state, $translation_key = NULL) {

		$form = parent::buildForm($form, $form_state);
		$form['actions']['submit']['#value'] = $this->t('Delete translation');
		$form['key_to_delete'] = [
			'#type' => 'hidden',
			'#value' => $translation_key,
		] ;
		$form['text'] = [
			'#markup' => $this->t('<p>Are you sure you want to delete <b>@key</b> translation</p>', ['@key' => $translation_key]),
		];

		return $form;

	}

	public function submitForm(array &$form, FormStateInterface $form_state) {
		$config_key = 'htm_custom_translations_new.translation';
		$translation_key = $form_state->getValue('key_to_delete');

		$this->config($config_key)->clear($translation_key)->save();
		$this->messenger->addMessage($this->t('Key deleted'));
		$form_state->setRedirect('htm_custom_translations_new.translation_form');
	}


}
