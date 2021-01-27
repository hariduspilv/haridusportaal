<?php

namespace Drupal\htm_custom_oska\Form;

use Drupal;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Entity\ContentEntityDeleteForm;
use Drupal\Core\Entity\EntityDeleteFormTrait;
use Drupal\Core\Form\FormStateInterface;

/**
 * Provides a form for deleting Oska file entity entities.
 *
 * @ingroup htm_custom_oska
 */
class OskaFileEntityDeleteForm extends ContentEntityDeleteForm {

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildForm($form, $form_state);
    $entity = $this->getEntity();

    // uploaded csv file name
    $filename = $entity->getFileId().'.csv';

    // check if the file name exists somewhere in the oska dynamic graphs
    $file_name_parts = explode('.', $filename);
    $file_name = $file_name_parts[0];
    $database = Drupal::database();

    $query = $database->select('node__field_dynamic_graph', 'f');
    $query->fields('f')
      ->condition('field_dynamic_graph_filter_values',  '%' . $database->escapeLike('"graph_source_file":"'.$file_name.'"') . '%', 'LIKE');
    $results = $query->execute()->fetchAll();

    // If file is already used in some infograph, then dont show the delete button, instead tell users that these files are in use
    if(!empty($results)) {
      $host = Drupal::request()->getSchemeAndHttpHost();
      $output = t('<div><p>The file <b>@key</b> cannot be deleted, it is being used in the following pages infographics:</p>', ['@key' => $filename]);
      foreach ($results as $result) {
        $node_path = $host .  Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $result->entity_id);
        $output .= '<a href="' .  $node_path . '" target="_blank">' . $node_path . '</a> </br>';
      }
      $output .= '<p>If you wish to delete the file, first remove it from where it is being used.</p></div>';
      $form['files_exist']['#markup'] = $output;
      $form['description'] = [];
      $form['actions'] = [];

    }
    // If the file is not being used, let the user delete the file
    else {
      $form['description'] = [];

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
        '#markup' => $this->t('<p>The file <b>@key</b> is not being used in any infographic, it can be removed.</p>
        <p>Do you want to delete it?</p><br>', ['@key' => $filename]),
      ];
    }
    return $form;
  }

    /**
     * {@inheritdoc}
     */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $entity = $this->getEntity();

    // Delete the file and its filters, then send the user back to the OskaFileEntity list page
    $filename = $form_state->getValue('file_to_delete');
    $file_path = '/app/drupal/web/sites/default/files/private/oska_csv/'.$filename;
    $filters_path = '/app/drupal/web/sites/default/files/private/oska_filters/'.pathinfo($filename, PATHINFO_FILENAME);
    array_map( 'unlink', array_filter((array) glob($filters_path."/*")));
    rmdir($filters_path);
    unlink($file_path);
    Cache::invalidateTags([pathinfo($filename, PATHINFO_FILENAME).'_csv']);
    \Drupal::logger('entity.oska_file_entity.collection')->notice($filename.' has been deleted.');
    $form_state->setRedirect('entity.oska_file_entity.collection');

    // Delete the entity value associated with the deleted file from the OskaFileEntity list
    $entity->delete();
  }
}
