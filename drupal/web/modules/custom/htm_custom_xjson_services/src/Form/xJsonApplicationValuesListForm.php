<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class xJsonApplicationValuesListForm extends FormBase {

  public function getFormId() {
    return 'application_identifiers_list';
  }

  public function buildForm(array $form, FormStateInterface $form_state, $form_name = NULL)
  {
    $directory = "/app/drupal/web/sites/default/files/private/application-values/".$form_name;

    $identifier_list = array_diff(scandir($directory), array('.', '..'));

    $header = [
      'identifier' => $this->t('Identifier'),
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#empty' => t('No XMLs found.'),
    ];

    foreach($identifier_list as $key => $identifier){

      $parsed_identifier = preg_replace('/\\.[^.\\s]{3,4}$/', '', $identifier);

      $form['table'][$key]['identifier'] = [
        '#type' => 'link',
        '#title' => $parsed_identifier,
        '#url' => Url::fromRoute('htm_custom_xjson_services.identifier_files_list_form', ['identifier' => $parsed_identifier, 'form_name' => $form_name]),
      ];
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // TODO: Implement submitForm() method.
  }

}
