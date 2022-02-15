<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\htm_custom_oska\Entity\OskaIndicatorEntity;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\node\Entity\Node;
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
      'seotud_ametid' => false,
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

      if($item['seotud_ametid']) {
        $jobs = explode(',', $item['seotud_ametid']);
        if(is_array($jobs) && count($jobs) > 1) {
          // If there is more than one related job then loop through them and get node id of each
          foreach($jobs as $job => $j) {
            $object['seotud_ametid'][] = self::checkEntityReference('node', [
              'type' => 'oska_main_profession_page',
              'field_profession' => true,
              'title' => $j
            ]);
          }
        } else {
          $object['seotud_ametid'] = self::checkEntityReference('node', [
            'type' => 'oska_main_profession_page',
            'field_profession' => true,
            'title' =>  $item['seotud_ametid']
          ]);
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
      }elseif($object['ametiala'] && !$object['seotud_ametid'] && !$object['oppevaldkond'] && !$object['oppesuund'] && !$object['oppekavaruhm'] && !$object['oppetase']){
        $error_messag_func = function() {
              return t('Only main profession entered');
        };
        $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func());
      }else{
        $results[$object['ametiala']]['field_job_link'][] = $object['seotud_ametid'];
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
        $i = $context['sandbox']['current_id'];

        foreach($context['results']['values'] as $main_proffession => $paragraph_items){

          //load main profession page, for updating values
          $main_profession_page = \Drupal::entityTypeManager()->getStorage('node')->load($main_proffession);

          $sidebar_paragraph = Paragraph::load($main_profession_page->get('field_sidebar')->getValue()[0]['target_id']);

          $old_study_paragraphs = $sidebar_paragraph->get('field_iscedf_search_link')->getValue();
          $old_job_paragraphs = $sidebar_paragraph->get('field_jobs')->getValue();

          #remove and delete old paragraphs from content
          $sidebar_paragraph->set('field_iscedf_search_link', null);
          $sidebar_paragraph->set('field_jobs', null);
          foreach($old_job_paragraphs as $paragraph){
            $paragraph = Paragraph::load($paragraph['target_id']);
            if($paragraph){
              $paragraph->delete();
            }
          }
          foreach($old_study_paragraphs as $paragraph){
            $paragraph = Paragraph::load($paragraph['target_id']);
            if($paragraph){
              $paragraph->delete();
            }
          }

          $new_paragraphs = [];

          $paragraph = Paragraph::create([
            'type' => 'iscedf_search',
          ]);

          foreach($paragraph_items as $label => $value){
            if($label !== 'field_job_link') {
              $paragraph->set($label, array_unique($value));
              // For related jobs paragraph
            } else {
              // If there is more than one related job then loop through them and create paragraph for each
              if(is_array($value[0])) {
                foreach($value[0] as $job => $j_nid) {
                  $node = Node::load($j_nid);
                  $job_paragraph = Paragraph::create([
                    'type' => 'job',
                  ]);
                  $job_paragraph->set($label, [
                    'uri' => 'entity:node/'.$j_nid,
                    'title' => $node->getTitle()
                  ]);
                  $job_paragraph->set('field_job_name', $node->getTitle());
                  $job_paragraph->save();
                  $new_paragraph = [
                    'target_id' => $job_paragraph->id(),
                    'target_revision_id' => $job_paragraph->getRevisionId()];
                  $context['results']['processed'][] = $job_paragraph->id();

                  $sidebar_paragraph->get('field_jobs')->appendItem($new_paragraph);
                  $sidebar_paragraph->save();
                }
                // If there is only one related job then create only one paragraph
              } else {
                $node = Node::load(array_unique($value)[0]);
                $job_paragraph = Paragraph::create([
                  'type' => 'job',
                ]);
                $job_paragraph->set($label, [
                  'uri' => 'entity:node/'.array_unique($value)[0],
                  'title' => $node->getTitle()
                ]);
                $job_paragraph->set('field_job_name', $node->getTitle());
                $job_paragraph->save();
                $new_paragraph = [
                  'target_id' => $job_paragraph->id(),
                  'target_revision_id' => $job_paragraph->getRevisionId()];
                $context['results']['processed'][] = $job_paragraph->id();

                $sidebar_paragraph->get('field_jobs')->appendItem($new_paragraph);
                $sidebar_paragraph->save();
              }
            }
          }

          // For paragraphs that are not related jobs
          $paragraph->save();
          $new_paragraph = [
            'target_id' => $paragraph->id(),
            'target_revision_id' => $paragraph->getRevisionId()];
          $context['results']['processed'][] = $paragraph->id();

          $sidebar_paragraph->set('field_iscedf_search_link', $new_paragraph);
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

  public static function CleanUntouchedNodes($items, &$context){

    if(empty($context['results']['error'])) {
      if (empty($context['sandbox'])) {
        $context['sandbox']['progress'] = 0;
        $context['sandbox']['current_id'] = 0;
      }

      $nid_result = \Drupal::entityQuery('node')
        ->condition('type', 'oska_main_profession_page')
        ->execute();

      $context['sandbox']['max'] += count($nid_result);

      $imported_values = array_keys($context['results']['values']);

      $untouchedNodes = array_diff(array_values($nid_result), $imported_values);

      foreach($untouchedNodes as $nid){
        $main_profession_page = \Drupal::entityTypeManager()->getStorage('node')->load($nid);

        $sidebar_paragraph = Paragraph::load($main_profession_page->get('field_sidebar')->getValue()[0]['target_id']);

        $old_study_paragraphs = $sidebar_paragraph->get('field_iscedf_search_link')->getValue();
        $old_job_paragraphs = $sidebar_paragraph->get('field_jobs')->getValue();

        #remove and delete old paragraphs from content
        $sidebar_paragraph->set('field_iscedf_search_link', null);
        $sidebar_paragraph->set('field_jobs', null);
        foreach($old_job_paragraphs as $paragraph){
          $paragraph = Paragraph::load($paragraph['target_id']);
          if($paragraph){
            $paragraph->delete();
          }
        }
        foreach($old_study_paragraphs as $paragraph){
          $paragraph = Paragraph::load($paragraph['target_id']);
          if($paragraph){
            $paragraph->delete();
          }
        }

        $context['sandbox']['progress']++;
        $context['message'] = $context['sandbox']['max'];
      }
      $context['finished'] = 1;
      $context['sandbox']['current_id']++;
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
      // An error occurred.
      // $operations contains the operations that remained unprocessed.
      $error_operation = reset($operations);
      $message = t('An error occurred while processing %error_operation with arguments: @arguments', array('%error_operation' => $error_operation[0], '@arguments' => print_r($error_operation[1], TRUE)));
      \Drupal::messenger()->addError($message);
    }
    \Drupal::messenger()->addMessage($message[0], $message[1]);
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
