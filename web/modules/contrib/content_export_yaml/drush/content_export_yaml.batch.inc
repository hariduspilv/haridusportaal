<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
use \Drupal\content_export_yaml\ContentExport ;


/**Bacth Function for  export a node**/
function content_export_yaml_index_batch_process($info, $context)
{
    try {
      $export = new ContentExport();
      $status = $export->exportContent($info['id']);
      if($status){
        drush_print('Success exported id = '.$info['id']);
      }
    } catch (\Exception $e) {
        $message = "Item :" . $info['index']. " Error: " . $e->getMessage();
        \Drupal::logger("content_export_yaml")->error($message);
    }
}
/**Bacth Function for  import a node**/
function content_export_yaml_import_index_batch_process($info, $context)
{
  // check if numeric
  try {
    $export = new ContentExport();
    $status = $export->importContentNode($info['id']);
    if($status){
      drush_print('Success imported id = '.$info['index']);
    }
  } catch (\Exception $e) {
    $message = "Item :" . $info['index']. " Error: " . $e->getMessage();
    \Drupal::logger("content_export")->error($message);
  }


}



/**Bacth Function for  import a block**/
function content_export_yaml_block_cim_index_batch_process($info, $context){
  try {
    $export = new ContentExport();
    $status = $export->import($info['id'],'block_content',$info['type']);
    if($status){
      drush_print('Success imported id = '.$info['index']);
    }
  } catch (\Exception $e) {
    $message = "Item :" . $info['index']. " Error: " . $e->getMessage();
    \Drupal::logger("content_export")->error($message);
  }
}
/**Bacth Function for  export a block**/
function content_export_yaml_block_index_batch_process($info, $context)
{
  try {
    $export = new ContentExport();
    $status = $export->export($info['id'],'block_content',$info['type']);
    if($status){
      drush_print('Success exported id = '.$info['id']);
    }
  } catch (\Exception $e) {
    $message = "Item :" . $info['index']. " Error: " . $e->getMessage();
    \Drupal::logger("content_export_yaml")->error($message);
  }


}

/**Bacth Function for  export a all entity **/
function content_export_yaml_cex_index_batch_process($info, $context)
{
  try {
    $export = new ContentExport();
    $status = $export->export($info['id'],$info['entity'],$info['type']);
    if($status){
      drush_print('Success exported id = '.$info['id']);
    }
  } catch (\Exception $e) {
    $message = "Item :" . $info['id']. " Error: " . $e->getMessage();
    \Drupal::logger("content_export_yaml")->error($message);
  }

}
function content_export_yaml_cim_index_batch_process($info, $context){
  try {
    $export = new ContentExport();
    $status = $export->importEntity($info['id'],$info['entity'],$info['id_label'],$info['bundle_label']);
    if($status){
      drush_print('Success imported num = '.$info['index']);
    }
  } catch (\Exception $e) {
    $message = "Item number :" . $info['index']. " Error: " . $e->getMessage();
    \Drupal::logger("content_export")->error($message);
  }
}
