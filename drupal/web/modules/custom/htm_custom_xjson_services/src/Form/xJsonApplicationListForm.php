<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class xJsonApplicationListForm extends FormBase {

  public function getFormId() {
    return 'application_results_list';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $directory = "/app/drupal/web/sites/default/files/private/application-values";

    $application_list = array_diff(scandir($directory), array('.', '..'));

    $header = [
      'form_name' => $this->t('Form name'),
      //'file' => $this->t('File'),
      //'delete' => $this->t('Delete'),
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#empty' => t('No XMLs found.'),
    ];

    foreach($application_list as $key => $application_form){

      //$entity_id = preg_replace('/\\.[^.\\s]{3,4}$/', '', $xml_name);

      $form['table'][$key]['form_name'] = [
        '#type' => 'link',
        '#title' => $application_form,
      ];

/*      $form['table'][$key]['file'] = [
        '#type' => 'link',
        '#title' => $this->t('Download'),
        '#url' => Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].'/sites/default/files/private/classificator/'.$xml_name),
      ];

      $form['table'][$key]['delete'] = [
        '#type' => 'link',
        '#title' => $this->t('Delete'),
        '#url' => Url::fromRoute('htm_custom_xjson_services.classificator_delete_data_form', ['filename' => $xml_name]),
      ];*/
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // TODO: Implement submitForm() method.
  }

}
