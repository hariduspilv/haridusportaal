<?php

namespace Drupal\htm_custom_infograph\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Messenger\MessengerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class TranslationFormDeleteTranslation.
 */
class InfographDeleteCsvForm extends FormBase {

	/**
	 * {@inheritdoc}
	 */
	public function getFormId() {
		return 'infograph_delete';
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

		$form['actions']['submit']['#value'] = $this->t('Delete infograph');
		$form['file_to_delete'] = [
			'#type' => 'hidden',
			'#value' =>  $filename,
		] ;
		$form['text'] = [
			'#markup' => $this->t('<p>Are you sure you want to delete <b>@key</b>.csv infograph?</p>', ['@key' => $filename]),
		];

		return $form;
	}

	public function submitForm(array &$form, FormStateInterface $form_state) {
	  $filename = $form_state->getValue('file_to_delete');
	  $file_path = '/app/drupal/web/sites/default/files/private/infograph/'.$filename;
	  $filters_path = '/app/drupal/web/sites/default/files/private/infograph_filters/'.pathinfo($filename, PATHINFO_FILENAME);
    array_map( 'unlink', array_filter((array) glob($filters_path."/*")));
    rmdir($filters_path);
	  unlink($file_path);
		$form_state->setRedirect('htm_custom_infograph.infograph_csv_list_form');
	}
}
