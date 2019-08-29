<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\htm_custom_oska\Entity\OskaIndicatorEntity;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessOskaStudiesData
 * @package Drupal\htm_custom_oska
 */
class ProcessOskaStudiesData {


  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static();
  }

  public static function ValidateFile($items, &$context){
    $message = t('Validating file');

    #dump(self::$k['EHIS_ID']);
    $results = [];
    $object = [
      'ametiala' => false,
      'oppevaldkond' => false,
      'oppesuund' => false,
      'oppekavaruhm' => false,
      'oppetase' => false,
    ];
    $required_fields = [
      'ametiala'
    ];

    foreach ($items as $index => $item){

      foreach($item as $key => $value){
        if(mb_detect_encoding($key) == 'UTF-8'){
          unset($item[$key]);
          $item[cleanString($key)] = $value;
        }
      }

      $object['ametiala'] = self::checkEntityReference('node', ['type' => 'oska_main_profession_page', 'title' =>  $item['ametiala']]);
      $object['oppevaldkond'] = is_numeric($item['oppevaldkond']) ? self::checkEntityReference('taxonomy_term', ['vid' => 'isced_f', 'field_code' => strlen((string)$item['oppevaldkond']) === 1 ? '0'.$item['oppevaldkond'] : $item['oppevaldkond']]) : FALSE;
      $object['oppesuund'] =  is_numeric($item['oppesuund']) ? self::checkEntityReference('taxonomy_term', ['vid' => 'isced_f', 'field_code' => strlen((string)$item['oppesuund']) === 2 ? '0'.$item['oppesuund'] : $item['oppesuund']]) : FALSE;
      $object['oppekavaruhm'] = is_numeric($item['oppekavaruhm']) ? self::checkEntityReference('taxonomy_term', ['vid' => 'isced_f', 'field_code' => strlen((string)$item['oppekavaruhm']) === 3 ? '0'.$item['oppekavaruhm'] : $item['oppekavaruhm']]) : FALSE;
      $object['oppetase'] = self::checkEntityReference('taxonomy_term', ['vid' => 'studyprogrammelevel', 'field_ehis_output' => $item['oppetase']]);

      if(!$object['ametiala']){

        $error_messag_func = function($values, $required_fields) {
          foreach($values as $key => $value){
            if(in_array($key, $required_fields) && $value === FALSE){
              return t('Missing ').$key;
            }
          }
        };
        $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func($object, $required_fields));
      }elseif($object['ametiala'] && !$object['oppevaldkond'] && !$object['oppesuund'] && !$object['oppekavaruhm'] && !$object['oppetase']){
        $error_messag_func = function() {
              return t('Only main profession entered');
        };
        $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func());
      }else{
        $results[$object['ametiala']]['field_iscedf_broad'][] = $object['oppevaldkond'];
        $results[$object['ametiala']]['field_iscedf_narrow'][] = $object['oppesuund'];
        $results[$object['ametiala']]['field_iscedf_search_term'][] = $object['oppekavaruhm'];
        $results[$object['ametiala']]['field_level'][] = $object['oppetase'];
      }
    }

    $context['message'] = $message;
    $context['results']['values'] = $results;
  }

  public static function ProcessOskaStudiesData($items, &$context){
    //process only if no errors otherwise nothing
    if(empty($context['results']['error'])){
      if(empty($context['sandbox'])){
        $context['sandbox']['progress'] = 0;
        $context['sandbox']['current_id'] = 0;
        $context['sandbox']['max'] = count($context['results']['values']);
      }

      $context['results']['processed'] = [];

      if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
        $limit = $context['sandbox']['current_id'] + 10;
        if ($context['sandbox']['max'] - $context['sandbox']['current_id'] < 10){
          $limit = $context['sandbox']['max'];
        }
        $i = $context['sandbox']['current_id'];

        foreach($context['results']['values'] as $main_proffession => $paragraph_items){

          //load main profession page, for updating values
          $main_profession_page = \Drupal::entityTypeManager()->getStorage('node')->load($main_proffession);

          $sidebar_paragraph = Paragraph::load($main_profession_page->get('field_sidebar')->getValue()[0]['target_id']);

          $old_study_paragraphs = $sidebar_paragraph->get('field_iscedf_search_link')->getValue();

          #remove and delete old paragraphs from content
          $sidebar_paragraph->set('field_iscedf_search_link', []);
          foreach($old_study_paragraphs as $paragraph){
            $paragraph = Paragraph::load($paragraph['target_id']);
            if($paragraph){
              $paragraph->delete();
            }
          }

          $new_paragraphs = [];

          $paragraph = Paragraph::create([
            'type' => 'iscedf_search'
          ]);
          foreach($paragraph_items as $label => $value){
            $paragraph->set($label, array_unique($value));
          }
          $paragraph->save();
          $new_paragraphs[] = [
            'target_id' => $paragraph->id(),
            'target_revision_id' => $paragraph->getRevisionId()];
          $context['results']['processed'][] = $paragraph->id();

          $sidebar_paragraph->set('field_iscedf_search_link', $new_paragraphs);
          $sidebar_paragraph->save();

          $context['sandbox']['progress']++;
          $context['sandbox']['current_id'] = $i;
          $context['message'] = $context['sandbox']['max'];
          $i++;
        }
        $context['sandbox']['current_id']++;

        if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
          $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
        }
      }else{
        $context['finished'] = 1;
      }

    }
  }

  public static function ProcessOskaStudiesDataFinishedCallback($success, $results, $operations){
    // The 'success' parameter means no fatal PHP errors were detected. All
    // other error management should be handled using 'results'.
    if ($success) {
      if(isset($results['error'])){
        $message = [implode(', ', $results['error']), 'error'];
      }else{
        $message = [\Drupal::translation()->formatPlural(
          count($results['processed']),
          'One oska study processed.', '@count oska studies processed.'
        ), 'status'];
      }
    }
    else {
      $message = [t('Finished with an error.'), 'error'];
    }
    drupal_set_message($message[0], $message[1]);
  }

  public static function checkEntityReference($entity_type, $properties){

    $storage = \Drupal::entityTypeManager()->getStorage($entity_type);

    $result = $storage->loadByProperties($properties);

    if($result){
      $entity = reset($result);
    }

    return isset($entity) ? $entity->id() : FALSE;
  }
}
