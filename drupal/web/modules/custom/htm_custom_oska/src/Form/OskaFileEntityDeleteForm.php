<?php

namespace Drupal\htm_custom_oska\Form;

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

    $filename = $entity->getFileId().'.csv';

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
      '#markup' => $this->t('<p>Are you sure you want to delete <b>@key</b> infograph?</p>', ['@key' => $filename]),
    ];

    return $form;
  }

    /**
     * {@inheritdoc}
     */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $entity = $this->getEntity();
    $filename = $form_state->getValue('file_to_delete');
    $file_path = '/app/drupal/web/sites/default/files/private/oska_csv/'.$filename;
    $filters_path = '/app/drupal/web/sites/default/files/private/oska_filters/'.pathinfo($filename, PATHINFO_FILENAME);
    array_map( 'unlink', array_filter((array) glob($filters_path."/*")));
    rmdir($filters_path);
    unlink($file_path);
    Cache::invalidateTags([pathinfo($filename, PATHINFO_FILENAME).'_csv']);
    \Drupal::logger('entity.oska_file_entity.collection')->notice($filename.' has been deleted.');
    $form_state->setRedirect('entity.oska_file_entity.collection');
    $entity->delete();
  }
}
