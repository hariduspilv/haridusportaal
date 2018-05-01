<?php

namespace Drupal\taxonomy_term_depth\Form;

use Drupal\Core\Database\Database;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\taxonomy\VocabularyInterface;

class DepthDeleteDataForm extends FormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'gathercontent_remove_local_data_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    // drupal_set_message($this->t('This operation is irreversible and should be done before module uninstall!'), 'warning');
    $form['remove_depth_field_data'] = [
      '#type'   => 'Fieldset',
      '#title' => $this->t('Prepare Removing Depth Field Data.'),
      '#description' => $this->t('Clicking on this button will remove the depth field data.'),
    ];

    $form['remove_depth_field_data']['actions']['#type']  = 'actions';
    $form['remove_depth_field_data']['actions']['delete'] = [
      '#type'         => 'submit',
      '#value'        => $this->t('Delete data'),
      '#button_type'  => 'primary',
      '#return_value' => 'submit',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $query = \Drupal::database()->update('taxonomy_term_field_data')
      ->fields([
        'depth_level' => NULL
      ])
      ->execute();

    drupal_set_message($this->t('Taxonomy depth fields\' columns has been deleted.'));
  }

}
