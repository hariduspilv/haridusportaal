<?php

namespace Drupal\htm_custom_xjson_services\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Serializer\Encoder\CsvEncoder;
use Symfony\Component\Serializer\Serializer;

/**
 * Class xJsonClassificatorImportDataForm.
 */
class xJsonClassificatorImportDataForm extends FormBase {
  public function __construct(Serializer $serializer)
  {
    $this->serializer = $serializer;

    $this->classificator_path = '/app/drupal/web/sites/default/files/private/classificator';
  }

  public static function create(ContainerInterface $container)
  {
    return new static(
      $container->get('serializer')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'classificator_import';
  }
  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {

    $allowed_extensions = ['xml'];

    $form['file'] = [
      '#type' => 'file',
      '#title' => $this->t('XML file upload'),
      '#upload_validators' => [
        'file_validate_extensions' => $allowed_extensions
      ],
      #'#required' => TRUE,
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import'),
    ];

    return $form;
  }

  public function validateForm(array &$form, FormStateInterface $form_state){
    if(!file_exists($this->classificator_path)) mkdir($this->classificator_path, 0744, true);

    $file = $_FILES['files'];
    if (!empty($file)) {
      $form_state->setValue('file', $file);
      return;
    }else{
      $form_state->setErrorByName('file', $this->t('No XML uploaded!'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $file = $form_state->getValue('file');
    $file_path = $file['tmp_name']['file'];
    $file_name = $file['name']['file'];
    $doc = new \DOMDocument();

    if(@$doc->load($file_path)){
      kint("$file_path is a valid XML document");
    } else {
      kint("$file_path is NOT a valid document");
    }

    $xml_content = file_get_contents($file_path);
    $file = fopen($this->classificator_path.'/'.$file_name, 'w');
    fwrite($file, $xml_content);

    //Cache::invalidateTags([$filename.'_csv']);
    $form_state->setRedirect('htm_custom_infograph.infograph_csv_list_form');
  }

}
