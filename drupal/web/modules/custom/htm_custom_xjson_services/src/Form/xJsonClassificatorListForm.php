<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class xJsonClassificatorListForm extends FormBase {

  public function getFormId() {
    return 'classificator_csv_list';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $directory = "/app/drupal/web/sites/default/files/private/classificator";

    $xml_list = array_diff(scandir($directory), array('.', '..'));

    $header = [
      'filename' => $this->t('File name'),
      'file' => $this->t('File'),
      'delete' => $this->t('Delete'),
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#empty' => t('No XMLs found.'),
    ];

    foreach($xml_list as $key => $xml_name){

      $entity_id = preg_replace('/\\.[^.\\s]{3,4}$/', '', $xml_name);

      $form['table'][$key]['filename'] = [
        '#type' => 'item',
        '#title' => $xml_name,
      ];

      $form['table'][$key]['file'] = [
        '#type' => 'link',
        '#title' => $this->t('Download'),
        '#url' => Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/sites/default/files/private/classificator/'.$xml_name),
      ];

      $form['table'][$key]['delete'] = [
        '#type' => 'link',
        '#title' => $this->t('Delete'),
        '#url' => Url::fromRoute('htm_custom_xjson_services.delete_classificator', ['filename' => $xml_name]),
      ];
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // TODO: Implement submitForm() method.
  }

}
