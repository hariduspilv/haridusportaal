<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class xJsonClassificatorDeleteForm.
 */
class xJsonClassificatorDeleteForm extends FormBase {

	/**
	 * {@inheritdoc}
	 */
	public function getFormId() {
		return 'classificator_delete';
	}

	/**
	 * {@inheritdoc}
	 */
	public function buildForm(array $form, FormStateInterface $form_state, $filename = NULL) {

    $form['actions']['#type'] = 'actions';
    $form['actions']['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save configuration'),
      '#button_type' => 'primary',
    ];

		$form['actions']['submit']['#value'] = $this->t('Delete classificators');
		$form['file_to_delete'] = [
			'#type' => 'hidden',
			'#value' =>  $filename,
		] ;
		$form['text'] = [
			'#markup' => $this->t('<p>Are you sure you want to delete <b>@key</b> classificators?</p>', ['@key' => $filename]),
		];

		return $form;
	}

	public function submitForm(array &$form, FormStateInterface $form_state) {
	  $filename = $form_state->getValue('file_to_delete');
	  $file_path = '/sites/default/files/private/classificator/'.$filename;
	  unlink($file_path);
    \Drupal::logger('htm_custom_xjson_services')->notice($filename.' has been deleted.');
		$form_state->setRedirect('htm_custom_xjson_services.classificator_list_form');
	}
}
