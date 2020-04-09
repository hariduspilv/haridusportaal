<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;

class xJsonApplicationValueFilesListForm extends FormBase {

  public function getFormId() {
    return 'application_value_files_list';
  }

  public function buildForm(array $form, FormStateInterface $form_state, $form_name = NULL, $identifier = NULL)
  {
    $list = [];

    $result_directory = "/app/drupal/web/sites/default/files/private/application-values/".$form_name;
    $identifier_list = array_diff(scandir($result_directory), array('.', '..'));
    foreach($identifier_list as $value) {
      $parsed_identifier = preg_replace('/\\.[^.\\s]{3,4}$/', '', $value);
      if($parsed_identifier === $identifier) {
        $url = '/sites/default/files/private/application-values/'.$form_name.'/'.$value;
        $list[$value] = $url;
      }
    }

    $file_directory = "/app/drupal/web/sites/default/files/private/application-files/".$identifier;
    $file_list = array_diff(scandir($file_directory), array('.', '..'));
    foreach($file_list as $value) {
      $url = '/sites/default/files/private/application-files/'.$identifier.'/'.$value;
      $list[$value] = $url;
    }

    $header = [
      'file_name' => $this->t('File name'),
    ];

    $form['table'] = [
      '#type' => 'table',
      '#header' => $header,
      '#empty' => t('No files found.'),
    ];

    foreach($list as $key => $file_url){

      $form['table'][$key]['form_name'] = [
        '#type' => 'link',
        '#title' => $key,
        '#url' => Url::fromUri($_SERVER['REQUEST_SCHEME'].'://'.$_SERVER['HTTP_HOST'].$file_url),
      ];
    }

    return $form;
  }

  public function submitForm(array &$form, FormStateInterface $form_state)
  {
    // TODO: Implement submitForm() method.
  }

}
