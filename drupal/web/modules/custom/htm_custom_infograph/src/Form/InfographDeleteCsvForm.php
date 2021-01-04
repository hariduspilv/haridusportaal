<?php

namespace Drupal\htm_custom_infograph\Form;

use Drupal;
use Drupal\Core\Cache\Cache;
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

    $file_name_parts = explode('.', $filename);
    $file_name = $file_name_parts[0];
    $database = Drupal::database();
    $query = $database->select('node__field_infograph', 'f');
    $query->fields('f')
      ->condition('field_infograph_filter_values',  '%' . $database->escapeLike('"graph_source_file":"'.$file_name.'"') . '%', 'LIKE');
    $results = $query->execute()->fetchAll();

    // If file is already used in some infograph, dont show delete button but tell users that these files are in use
    if(!empty($results)) {
      $host = Drupal::request()->getSchemeAndHttpHost();
      $output = '<div><strong>See fail on kasutuses järgnevate lehtede infograafikas: </strong><br>';
      foreach ($results as $result) {
        $node_path = $host .  Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $result->entity_id);
        $output .= '<a href="' .  $node_path . '" target="_blank">' . $node_path . '</a> <br>';
      }
      $output .= '</div>';
      $form['files_exist']['#markup'] = $output;

    }
    // The file is not being used, so let user to delete the selected file
    else {
      $form['actions']['#type'] = 'actions';
      $form['actions']['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Save configuration'),
        '#button_type' => 'primary',
        '#prefix' => 'Faili ei ole kasutuses. Võite faili turvaliselt ära kustutada.<br>'
      ];

      $form['actions']['submit']['#value'] = $this->t('Delete infograph');
      $form['file_to_delete'] = [
        '#type' => 'hidden',
        '#value' =>  $filename,
      ] ;
      $form['text'] = [
        '#markup' => $this->t('<p>Are you sure you want to delete <b>@key</b>.csv infograph?</p>', ['@key' => $filename]),
      ];
    }
		return $form;
	}


  public function submitForm(array &$form, FormStateInterface $form_state) {
	  $filename = $form_state->getValue('file_to_delete');
	  $file_path = '/app/drupal/web/sites/default/files/private/infograph/'.$filename;
	  $filters_path = '/app/drupal/web/sites/default/files/private/infograph_filters/'.pathinfo($filename, PATHINFO_FILENAME);
    array_map( 'unlink', array_filter((array) glob($filters_path."/*")));
    rmdir($filters_path);
	  unlink($file_path);
    Cache::invalidateTags([pathinfo($filename, PATHINFO_FILENAME).'_csv']);
    Drupal::logger('htm_custom_infograph')->notice($filename.' has been deleted.');
		$form_state->setRedirect('htm_custom_infograph.infograph_csv_list_form');
	}
}
