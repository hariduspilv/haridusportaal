<?php

namespace Drupal\htm_custom_variables\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class VariableFormEditVariable.
 */
class VariableFormDeleteVariable extends ConfigFormBase {

	/**
	 * The Messenger service.
	 *
	 * @var \Drupal\Core\Messenger\MessengerInterface
	 */
	protected $messenger;

	/**
	 * VariableFormBase constructor.
	 *
	 * @param \Drupal\Core\Messenger\MessengerInterface $messenger
	 *   The messenger service.
	 */
	public function __construct(MessengerInterface $messenger) {
		$this->messenger = $messenger;
	}

	/**
	 * @param ContainerInterface $container
	 * @return ConfigFormBase|VariableFormBase
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
				'htm_custom_variables.variable',
		];
	}

	/**
	 * {@inheritdoc}
	 */
	public function getFormId() {
		return 'variable_form';
	}

	/**
	 * {@inheritdoc}
	 */
	public function buildForm(array $form, FormStateInterface $form_state, $variable_key = NULL) {

		$form = parent::buildForm($form, $form_state);
		$form['actions']['submit']['#value'] = $this->t('Delete variable');
		$form['key_to_delete'] = [
			'#type' => 'hidden',
			'#value' => $variable_key,
		] ;
		$form['text'] = [
			'#markup' => $this->t('<p>Are you sure you want to delete <b>@key</b> variable</p>', ['@key' => $variable_key]),
		];

		return $form;

	}

	public function submitForm(array &$form, FormStateInterface $form_state) {
		$config_key = 'htm_custom_variables.variable';
		$variable_key = $form_state->getValue('key_to_delete');

		$this->config($config_key)->clear($variable_key)->save();
		$this->messenger->addMessage($this->t('Key deleted'));
		$form_state->setRedirect('htm_custom_variables.variable_form');
	}


}
