<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class xJsonApplicationListForm extends FormBase {

  public function getFormId() {
    return 'application_forms_list';
  }

  public function buildForm(array $form, FormStateInterface $form_state)
  {
    $directory = "/app/drupal/web/sites/default/files/private/application-values";

    $application_list = array_diff(scandir($directory), array('.', '..'));

    $header = [
      'form_name' => $this->t('Form name'),
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#empty' => t('No XMLs found.'),
    ];

    foreach($application_list as $key => $application_form){

      $form['table'][$key]['form_name'] = [
        '#type' => 'link',
        '#title' => $application_form,
        '#url' => Url::fromRoute('htm_custom_xjson_services.identifier_list_form', ['form_name' => $application_form]),
      ];
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // TODO: Implement submitForm() method.
  }

}
