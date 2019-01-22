<?php

namespace Drupal\vbo_content_export_yaml\Plugin\Action;


use Drupal\content_export_yaml\ContentExport;
use Drupal\views_bulk_operations\Action\ViewsBulkOperationsActionBase;
use Drupal\views_bulk_operations\Action\ViewsBulkOperationsPreconfigurationInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Session\AccountInterface;

/**
 * An example action covering most of the possible options.
 *
 * If type is left empty, action will be selectable for all
 * entity types.
 *
 * @Action(
 *   id = "export_view_content_yaml",
 *   label = @Translation("Export Contents To YAML"),
 *   type = "",
 *   confirm = FALSE,
 *   pass_context = TRUE,
 *   pass_view = TRUE
 * )
 */
class VBExportAction extends ViewsBulkOperationsActionBase implements ViewsBulkOperationsPreconfigurationInterface {


  public $export = null ;
  public function __construct() {
    $this->export = new ContentExport();
  }

//  public function executeMultiple(array $objects) {
//
//    $message = t('Cliquer <a download href="@link">Ici</a> pour telecharger  le fichier .',['@link' => $path_excel]);
//    drupal_set_message($message);
//    return sprintf('Success' );
//  }
  /**
   * {@inheritdoc}
   */
  public function execute($entity = NULL) {
    /*
     * All config resides in $this->configuration.
     * Passed view rows will be available in $this->context.
     * Data about the view used to select results and optionally
     * the batch context are available in $this->context or externally
     * through the public getContext() method.
     * The entire ViewExecutable object  with selected result
     * rows is available in $this->view or externally through
     * the public getView() method.
     */
    // Do some processing..
    // ...
//        static  $elements = [] ;
//        static $index = 1;
//    $parser = new ExportView();
//    $max = $this->view->total_rows;
//    $entity = $parser->node_parser($entity,[],['#hook_alias'=>'exp_']);
//    $items = [
//      'nid' => $entity['nid'],
//      'title' => $entity['title'],
//      //'image' => $entity['field_image'][0][''],
//      'achat' => $entity['field_autre_prix']['achat'],
//      'vente' => $entity['field_autre_prix']['vente'],
//    ];
//    $elements [] = $items ;
    
//    if($index==1){
//      //$this->export = new \PHPExcel();
//
//      $this->export->setActiveSheetIndex(0);

  //  if($max == $index ){

  //  }

     ///   $base = new Base();
     //   $revendeur=$this->configuration["field_revendeur"];
     //   $ids  = $base->deformat_auto_completion($revendeur);
       /// $entity->field_client->target_id = $ids[0];
      //  $status = $entity->save();

      //  if($status==2){
         // sprintf('Last  : '. $entity->id() );

     //   $index = $index + 1;

    $entity_type = $entity->getEntityTypeId();
    $type = $entity->bundle();
    $id = $entity->id();
    $this->export->exportContent($id,$entity_type,$type);
    return sprintf('Success' );
      //  }else{

       //   return sprintf('Modifier Revendeur Annuler');
      //  }
  }


  /**
   * {@inheritdoc}
   */
  public function buildPreConfigurationForm(array $form, array $values, FormStateInterface $form_state) {
    return $form;
  }

  /**
   * Configuration form builder.
   *
   * If this method has implementation, the action is
   * considered to be configurable.
   *
   * @param array $form
   *   Form array.
   * @param Drupal\Core\Form\FormStateInterface $form_state
   *   The form state object.
   *
   * @return array
   *   The configuration form.
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {

//    $form['path_folder_export'] = [
//      '#type' => 'textfield',
//      '#title' => t('Folder path'),
//    ];
    return $form;
  }

  /**
   * Submit handler for the action configuration form.
   *
   * If not implemented, the cleaned form values will be
   * passed direclty to the action $configuration parameter.
   *
   * @param array $form
   *   Form array.
   * @param Drupal\Core\Form\FormStateInterface $form_state
   *   The form state object.
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    // This is not required here, when this method is not defined,
    // form values are assigned to the action configuration by default.
    // This function is a must only when user input processing is needed.

   // $this->configuration['file_name_export'] = $form_state->getValue('file_name_export');
  }

  /**
   * {@inheritdoc}
   */
  public function access($object, AccountInterface $account = NULL, $return_as_object = FALSE) {
    if ($object->getEntityType() === 'node') {
      $access = $object->access('update', $account, TRUE)
        ->andIf($object->status->access('edit', $account, TRUE));
      return $return_as_object ? $access : $access->isAllowed();
    }
     // kint($object->getEntityType());die();
    // Other entity types may have different
    // access methods and properties.
    return TRUE;
  }

}
