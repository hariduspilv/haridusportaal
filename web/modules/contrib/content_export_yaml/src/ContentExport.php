<?php
namespace Drupal\content_export_yaml;


use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml as SymfonyYaml;
use Symfony\Component\Yaml\Parser;
use Symfony\Component\HttpFoundation\RedirectResponse;
/**
 * Created by PhpStorm.
 * User: USER
 * Date: 11/13/18
 * Time: 2:04 PM
 */
class ContentExport {
  public $logger ;

  public function __construct() {
    $this->logger = \Drupal::logger('content_export_yaml');
  }
  public function export_single_file(){
      $path_file = \Drupal::service('file_system')->realpath("public://temp_yml");
      $items = $this->listFolderFiles($path_file);
      foreach ($items as $item){
        $new_item = $item['entity'];
        if($new_item){
          $file = $item['path'];
          $id = $new_item->id();
          $path_export = $this->get_export_path($new_item);
          if($path_export){
           $this->yml_copy($id,$file,$path_export);
          }

        }
      }
  }
  function yml_copy($file_name , $file,$path_export){
      $file_full_path = DRUPAL_ROOT.$file ;
      $fileSystem = \Drupal::service('file_system');
      if (!is_dir($path_export)) {
        if ($fileSystem->mkdir($path_export,0777, TRUE) === FALSE) {
          $this->logger->error('Failed to create directory '.$path_export);
          return false ;
        }
      }
      if(!copy($file_full_path,$path_export."/".$file_name.".yml"))
      {
        drupal_set_message("failed to copy $file","error");
      }else{
        drupal_set_message("Upload Success","status");
        $this->delete($file);
      }
  }


  function importByFilePath($file){
    $parsed = new Parser();
    $path_file =  DRUPAL_ROOT . $file ;
    $status = 0;
    if(file_exists($path_file)){
    $item_yaml = file_get_contents($path_file,FILE_USE_INCLUDE_PATH);
    $item_object = $parsed->parse($item_yaml, SymfonyYaml::PARSE_OBJECT);
    if(is_object($item_object)){
      $new_item = $item_object->createDuplicate();

      $status = $new_item->save();
      if($status==1){
        $entity_type = $new_item->getEntityTypeId();
        $type = $new_item->bundle();
        $id = $new_item->id();
        $this->export($id,$entity_type,$type);
        $this->delete($file);
      }
    }
    }
    return $status ;
  }
  function delete($file) {
    $file =  DRUPAL_ROOT . $file ;
      if (is_writable($file) && @unlink($file)) {
      }
      else {
        \Drupal::logger('content_export_yaml')->logger->error('File  not write : ' . $file);
      }
  }
  function listFolderFiles($dir)
  {
    $fileInfo     = scandir($dir);
    $allFileLists = [];
    $parsed = new Parser();

    foreach ($fileInfo as $folder) {


      if ($folder !== '.' && $folder !== '..') {
        if (is_dir($dir . DIRECTORY_SEPARATOR . $folder) === true) {

          $allFileLists[$folder] = $this->listFolderFiles($dir . DIRECTORY_SEPARATOR . $folder);
        } else {
          $path_file = $dir . DIRECTORY_SEPARATOR . $folder ;
          if(file_exists($path_file)){
          $item_yaml = file_get_contents($path_file,FILE_USE_INCLUDE_PATH);
          if($item_yaml){
            $item_object = $parsed->parse($item_yaml, SymfonyYaml::PARSE_OBJECT);
            $path = str_replace(DRUPAL_ROOT,"",$path_file);
            $allFileLists[$folder] = ["file" => $folder ,"path" => $path,"entity"=> $item_object];
          }
          }
        }
      }
    }

    return $allFileLists;
  }//end listFolderFiles()
  function load_exported_all(){

    $config = \Drupal::config('content_export_yaml.contentexportsetting');
    $themes_str = $config->get('path_export_content_folder');
    $items=[];
    if($themes_str){
    $result =   $this->listFolderFiles(DRUPAL_ROOT.$themes_str);
    foreach ($result as $key => $item_entity_type){
      foreach ($item_entity_type as $key => $item_bundle){
        foreach ($item_bundle as $key => $item){
          $items[] = $item ;
        }
      }
    }
    }
    return $items;


  }
  function content_type_list(){
    $node_types = \Drupal\node\Entity\NodeType::loadMultiple();
    $options = [];
    foreach ($node_types as $node_type) {
      $options[$node_type->id()] = $node_type->label();
    }
    return $options;
  }
  function load_entity_list($entity,$id_label,$bundle_label,$bundle,$ranges_nid=[]){
    $factory = \Drupal::entityTypeManager()->getStorage($entity)->getQuery();
    if($bundle!="all"){
      $factory->condition($bundle_label, $bundle);
    }
    if(!empty($ranges_nid)){
        $factory->condition($id_label,$ranges_nid,'BETWEEN');

    }
    return $factory->execute();
  }
  function load_block_list($bundle,$ranges_nid=[]){
    $factory = \Drupal::entityTypeManager()->getStorage("block_content")->getQuery();
    if($bundle!="all"){
    $factory->condition('type', $bundle);
    }
    if(!empty($ranges_nid)){
      $factory->condition('id',$ranges_nid,'BETWEEN');
    }
    return $factory->execute();
  }
  function load_term_list($bundle,$ranges_nid=[]){
    $factory = \Drupal::entityTypeManager()->getStorage("taxonomy_term")->getQuery();
    if($bundle!="all"){
      $factory->condition('vid', $bundle);
    }
    if(!empty($ranges_nid)){
      $factory->condition('tid',$ranges_nid,'BETWEEN');
    }
    return $factory->execute();
  }
  function load_term_config_list($bundle,$ranges_nid=[]){
    $items = [];
    $config = \Drupal::config('content_export_yaml.contentexportsetting');
    $themes_str = $config->get('path_export_content_folder');
    if($themes_str){
      if(empty($ranges_nid)){
        $items = $this->readDirectory($themes_str."/taxonomy_term/".$bundle);
        foreach ($items as $key => $file){
          if(file_exists($file)){
            $items[$key] = file_get_contents($file,FILE_USE_INCLUDE_PATH);
          }else{
            $this->logger->error('File  not find exist : '.$file);
          }
        }
      }else{
        for($i=$ranges_nid[0];$i < $ranges_nid[0]+1; $i++){
          $file = DRUPAL_ROOT.'/'.$themes_str."/taxonomy_term/".$bundle."/".$i.".yml";
          if(file_exists($file)){
            $items[$i] = file_get_contents($file,FILE_USE_INCLUDE_PATH);
          }else{
            $this->logger->error('File  not find exist : '.$file);
          }
        }
      }
    }else{
      $this->logger->error('Path directory empty ');
    }
    return $items ;
  }
  function load_node_config_list($bundle,$ranges_nid=[]){
    $items = [];
    $config = \Drupal::config('content_export_yaml.contentexportsetting');
    $themes_str = $config->get('path_export_content_folder');
    if($themes_str){
      if(empty($ranges_nid)){
        $items = $this->readDirectory($themes_str."/node/".$bundle);
        foreach ($items as $key => $file){
          if(file_exists($file)){
            $items[$key] = file_get_contents($file,FILE_USE_INCLUDE_PATH);
          }else{
            $this->logger->error('File  not find exist : '.$file);
          }
        }
      }else{
        for($i=$ranges_nid[0];$i < $ranges_nid[0]+1; $i++){
          $file = DRUPAL_ROOT.'/'.$themes_str."/node/".$bundle."/".$i.".yml";
          if(file_exists($file)){
            $items[$i] = file_get_contents($file,FILE_USE_INCLUDE_PATH);
          }else{
            $this->logger->error('File  not find exist : '.$file);
          }
        }
      }
    }else{
      $this->logger->error('Path directory empty ');
    }
    return $items ;
  }
  function load_block_list_config($bundle,$ranges_nid=[]){
    if($bundle=='all'){
      $bundle = null ;
    }
    return $this->load_entity_config_list('block_content',$bundle,$ranges_nid);
  }
  function load_entity_config_list($entity,$bundle=null,$ranges_nid=[]){
    $items = [];
    $config = \Drupal::config('content_export_yaml.contentexportsetting');
    $themes_str = $config->get('path_export_content_folder');
    if($themes_str){
      if(empty($ranges_nid)){
        if($bundle){
           $items = $this->readDirectory($themes_str."/".$entity."/".$bundle);
        }else{
           $items = $this->readDirectory($themes_str."/".$entity);
        }
        foreach ($items as $key => $file){
          if(file_exists($file)){
            $items[$key] = file_get_contents($file,FILE_USE_INCLUDE_PATH);
          }else{
            $this->logger->error('File  not find exist : '.$file);
          }
        }
      }else{
        for($i=$ranges_nid[0];$i < $ranges_nid[0]+1; $i++){
          if($bundle){
            $file = DRUPAL_ROOT.'/'.$themes_str."/".$entity."/".$bundle."/".$i.".yml";
          }else{
            $file = DRUPAL_ROOT.'/'.$themes_str."/".$entity."/".$i.".yml";
          }
          if(file_exists($file)){
            $items[$i] = file_get_contents($file,FILE_USE_INCLUDE_PATH);
          }else{
            $this->logger->error('File  not find exist : '.$file);
          }
        }
      }
    }else{
      $this->logger->error('Path directory empty ');
    }
    return $items ;
  }
  function readDirectory($directory){
    $path_file =[];
    if(is_dir(DRUPAL_ROOT.$directory)){
      $it = scandir(DRUPAL_ROOT.$directory);
      if(!empty($it)){
        foreach ($it as $fileinfo) {
          if ($fileinfo && strpos($fileinfo, '.yml') !== false) {
            $file =  DRUPAL_ROOT.$directory."/".$fileinfo ;
            if(file_exists($file)){
              $path_file[] = DRUPAL_ROOT.$directory."/".$fileinfo ;
            }
          }
        }
      }
    }
    return $path_file ;
  }

  function load_node_list($bundle,$ranges_nid=[]){
     $db = \Drupal::database();
     $query = $db->select('node_field_data','n');
     $query->fields('n', ['nid']);
     $query->condition('n.type',$bundle);
     if(!empty($ranges_nid)){
     $query->condition('n.nid',$ranges_nid,'BETWEEN');
     }
     return $query->execute()->fetchAllAssoc('nid');
   }
  function import($id,$entity){
    $parsed = new Parser();
    $node_object = $parsed->parse($id, SymfonyYaml::PARSE_OBJECT);
    if(is_object($node_object)){

      switch ($entity) {
        case "node":
          return $this->saving($node_object);
          break;
        case "block_content":
          return $this->saving_block($node_object);
          break;
      }
    }else{
      $this->logger->error('Failed to save item');
    }
    return false;

  }

  function importEntity($id,$entity,$id_label,$bundle_label){
    $parsed = new Parser();
    $node_object = $parsed->parse($id, SymfonyYaml::PARSE_OBJECT);
    if(is_object($node_object)){
          return $this->savingEntity($node_object,$entity,$id_label,$bundle_label);
    }else{
      $this->logger->error('Failed to save item');
    }
    return false;

  }
  function importContentNode($item){
     $parsed = new Parser();
     $node_object = $parsed->parse($item, SymfonyYaml::PARSE_OBJECT);
     if(is_object($node_object)){
       return $this->saving($node_object);
     }else{
       $this->logger->error('Failed to save item');
     }
   }
  function savingEntity($enity_clone,$entity,$id_label,$bundle_label){
    $entity_list = \Drupal::entityTypeManager()
      ->getStorage($entity)
      ->loadByProperties([
        $id_label=>$enity_clone->id(),
        $bundle_label => $enity_clone->bundle()
      ]);
    if(!empty($entity_list)){
      print ("update ");
      return $enity_clone->save();
    }else{
      print ("insert ");
      $enity_clone->{$id_label} = NULL;
      // Also handle modules that attach a UUID to the node.
      $enity_clone->uuid = \Drupal::service('uuid')->generate();
      // Anyonmymous users don't have a name.
      $enity_clone->created = time();
      $enity_clone->uid = 0;
      return $enity_clone->save();
    }
  }
  function saving($node_clone){
    $entity_type = $node_clone->getEntityTypeId();
    $node_list = \Drupal::entityTypeManager()
      ->getStorage($entity_type)
      ->loadByProperties([
        'nid'=>$node_clone->id(),
        'type'=> $node_clone->getType()
      ]);
    if(!empty($node_list)){
      print ("update ");
      return $node_clone->save();
    }else{
      print ("insert ");
      $node_clone->nid = NULL;
      $node_clone->vid = NULL;
      $node_clone->tnid = NULL;
      $node_clone->log = NULL;
      // Also handle modules that attach a UUID to the node.
      $node_clone->uuid = \Drupal::service('uuid')->generate();
      $node_clone->vuuid = NULL;
      // Anyonmymous users don't have a name.
      $node_clone->created = time();
      $node_clone->path = NULL;
      $node_clone->uid = 0;
      return $node_clone->save();
    }
  }
  function saving_block($block){

     $list = \Drupal::entityTypeManager()
       ->getStorage('block_content')
       ->loadByProperties([
         'id'=>$block->id(),
         'type'=> $block->bundle()
       ]);
     if(!empty($list)){
        print ("update ");
        return $block->save();
     }else{
       print ("insert ");
       $block->id = NULL;
        // Also handle modules that attach a UUID to the node.
       $block->uuid = \Drupal::service('uuid')->generate();
       $block->created = time();
       $block->uid = 0;
       $status =  $block->save();
       return $status;
     }
   }
  function get_export_path($entity){
    if(is_object($entity)){
      $entity_type = $entity->getEntityTypeId();
      $type = $entity->bundle();
      $config = \Drupal::config('content_export_yaml.contentexportsetting');
      $themes_str = $config->get('path_export_content_folder');
      if($themes_str){
        $themes_str = DRUPAL_ROOT.$themes_str;
        if($type){
          $final_path = $themes_str.'/'.$entity_type.'/'.$type;
        }else{
          $final_path = $themes_str.'/'.$entity_type ;
        }
        return  $final_path ;
      }else{
        $this->logger->error('Path directory empty ');
        return false;
      }
    }
  }
  function export($id,$entity,$type=null){
     if(is_object($id)){
       $item = $id ;
     }else{
      $item = \Drupal::entityTypeManager()
      ->getStorage($entity)->load($id);
     }
    if(is_object($item)){
      $yaml_content = $this->parserYAMLObject($item);
      $config = \Drupal::config('content_export_yaml.contentexportsetting');

      $themes_str = $config->get('path_export_content_folder');
      if($themes_str){
        $themes_str = DRUPAL_ROOT.'/'.$themes_str;
        if($type){
          $final_path = $themes_str.'/'.$entity.'/'.$type;
        }else{
          $final_path = $themes_str.'/'.$entity ;
        }
        return $this->generateFile($final_path ,$item->id(),$yaml_content);
      }else{
        $this->logger->error('Path directory empty ');
        return false;
      }
    }
    return false;

  }

  /**for node **/
  function exportContent($nid){
     $item = \Drupal::entityTypeManager()
       ->getStorage('node')->load($nid);
     return $this->export($nid,'node',$item->getType());

   }

   function parserYAMLObject($node){
     $yaml = new Dumper(2);
     return $yaml->dump($node, PHP_INT_MAX, 0, SymfonyYaml::DUMP_OBJECT);
   }
    function generateFile($directory,$filename,$content){
      $fileSystem = \Drupal::service('file_system');
      if (!is_dir($directory)) {
        if ($fileSystem->mkdir($directory,0777, TRUE) === FALSE) {
          $this->logger->error('Failed to create directory '.$directory);
          return false ;
        }
      }
      if (file_put_contents($directory . '/' . $filename.'.yml', $content) === FALSE) {
        $this->logger->error('Failed to write file '.$filename);
        return false;
      }
      if(@chmod($directory . '/' . $filename.'.html.twig',0777)){
        $this->logger->error('Failed to change permission file '.$filename);
      }
      @chmod($directory . '/' . $filename.'.html.twig',0777);
      return true;
    }
  public function redirectTo($url,$lang=null){
    global $base_url;
    $path = $base_url .'/'.$url ;
    $response = new RedirectResponse($path, 302);
    $response->send();
    return;
  }
}