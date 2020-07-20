<?php

namespace Drupal\htm_custom_infograph\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class InfographCsvListForm extends FormBase {

  /**
   * Returns a unique string identifying the form.
   *
   * The returned ID should be a unique string that can be a valid PHP function
   * name, since it's used in hook implementation names such as
   * hook_form_FORM_ID_alter().
   *
   * @return string
   *   The unique string identifying the form.
   */
  public function getFormId() {
    return 'infograph_csv_list';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $directory = "/app/drupal/web/sites/default/files/private/infograph";

    $csv_list = array_diff(scandir($directory), array('.', '..'));

    $header = [
      'filename' => $this->t('File name'),
      'file' => $this->t('File'),
      'delete' => $this->t('Delete'),
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#empty' => t('No CSVs found.'),
    ];

    foreach($csv_list as $key => $csv_name){

      $entity_id = preg_replace('/\\.[^.\\s]{3,4}$/', '', $csv_name);

      $form['table'][$key]['filename'] = [
        '#type' => 'item',
        '#title' => $csv_name,
      ];

      $form['table'][$key]['file'] = [
        '#type' => 'link',
        '#title' => $this->t('Download'),
        '#url' => Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/sites/default/files/private/infograph/'.$csv_name),
      ];

      $form['table'][$key]['delete'] = [
        '#type' => 'link',
        '#title' => $this->t('Delete'),
        '#url' => Url::fromRoute('htm_custom_infograph.delete_infograph', ['filename' => $csv_name]),
      ];
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // TODO: Implement submitForm() method.
  }

}
