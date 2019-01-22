<?php

namespace Drupal\content_export_yaml\Form;

use Drupal\content_export_yaml\ContentExport;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class ContentExportSettingForm.
 */
class ContentExportSettingForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'content_export_yaml.contentexportsetting',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'content_export_setting_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('content_export_yaml.contentexportsetting');
    $content_path = $config->get('path_export_content_folder');
    $export = new ContentExport() ;


    $param = \Drupal::request()->query->all();
    $list = $export->load_exported_all();
    $status = 0;
    if(isset($param['file'])){
      $status = $export->importByFilePath($param['file']);
    }
    if($status!=0 && $status!=-1){
      $status = -1 ;
      $export->redirectTo("/admin/config/content_export_yaml/setting");
    }
    if($status ==-1){
    drupal_set_message('Content Imported Suscessfully', 'status');
    }
    // Page contents
    $last = count($list)-1;
    $start = (isset($_GET['start'])) ? intval($_GET['start']) : 0;
    if ($start<0) $start = 0; if ($start > $last) $start = $last;

    $form['path_export_content_folder'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Path export content folder'),
      '#description' => $this->t('This folder path where your content will store'),
      '#maxlength' => 64,
      '#size' => 64,
      '#default_value' => $config->get('path_export_content_folder'),
    ];
    if($content_path){
      $form['upload_yml'] = [
        '#type' => 'managed_file',
        '#title' => t('Upload Content YML'),
        '#upload_validators' => array(
          'file_validate_extensions' => array('yml'),
          'file_validate_size' => array(25600000),
        ),
        '#upload_location' => 'public://temp_yml',
        '#required' => FALSE,
      ];
    }

    $maxpage = 10;
    if(!empty($list)) {
      $header = '<h2>Contents exported</h2>';
      $header .= '<h5>Total items ' . $last . ' current page : ' . $start . ' - ' . ($start + $maxpage) . '</h5>';
      $form['theme_element_header'] = [
        '#markup' => $header
      ];
    }
    // The data array
    $form['tableselect']= [
      '#type' => 'table',
      '#header' => [
        $this->t('ID'),
        $this->t('Label'),
        $this->t('Entity Type'),
        $this->t('Bundle'),
        $this->t('Download'),
        $this->t('Important')
      ],
      '#tableselect' => FALSE,
      '#empty' => t('No entity found')
    ];



    // Evaluate URL

    $params = '';
    foreach ($_GET as $key=>$value) {
      if (strtolower($key)=='start') continue;
      $params .= (empty($params)) ? "$key=$value" : "&$key=$value";
    }
    $curpage = 0;
    if(!empty($list)) {
      for ($xi = $start; $xi <= $last; $xi++) {
        if ($curpage >= $maxpage) {
          break;
        }
        $curpage++;
        $entity = $list[$xi]['entity'];
        $file = $list[$xi]['path'];

        if (is_object($entity)) {
          $label = ($entity->label());
          $entity_type = $entity->getEntityTypeId();
          $type = $entity->bundle();
          $id = $entity->id();
          $entity_item = \Drupal::entityTypeManager()
            ->getStorage($entity_type)
            ->load($id);
          $imported = FALSE;
          $label_exporter = $entity->label();

          if (is_object($entity_item)) {
            $label_item = $entity_item->label();
            if ($label_item == $label_exporter) {
              $imported = 'imported';
            }
          }
          else {
            $imported = '<a   href="/admin/config/content_export_yaml/setting?file=' . $file . '"> Click to import </a>';
          }
          $form['tableselect'][] = [
            '#attributes' => ['class' => ['draggable']],
            'id' => ['#plain_text' => $id],
            'Label' => ['#plain_text' => $label],
            'entity_type' => ['#plain_text' => $entity_type],
            'bundle' => ['#plain_text' => $type],
            'download' => ['#markup' => '<a download  href="' . $list[$xi]['path'] . '">Download</a>'],
            'import' => ['#markup' => $imported],
            '#empty' => t('No entity found'),
          ];
        }
      }


      // Navigation
      $prev = $start - $maxpage;
      if ($prev < 0) {
        $prev = 0;
      }
      $next = (($start + $maxpage) > $last) ? $start : $start + $maxpage;
      $prev = (($start - $maxpage) < 0) ? 0 : $start - $maxpage;
      $str = '<div>';
      if ($start != 0) {
        $str .= '<a href="/admin/config/content_export_yaml/setting?start=' . $prev . '"> < Previous</a>&nbsp;&nbsp;';
      }
      else {
        $str .= '<span>< Previous</span>&nbsp;&nbsp;';
      }
      if ($next != $start) {
        $str .= '<a href="/admin/config/content_export_yaml/setting?start=' . $next . '">Next > </a>';
      }
      else {
        $str .= '<span>Next ></span>';
      }
      $str .= '</div>';
      $form['theme_element'] = [
        '#markup' => $str
      ];
    }


    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $export = new ContentExport();
    $export->export_single_file();


    $this->config('content_export_yaml.contentexportsetting')
      ->set('path_export_content_folder', $form_state->getValue('path_export_content_folder'))
      ->save();
  }

}
