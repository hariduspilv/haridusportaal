<?php

namespace Drupal\htm_custom_infograph;

use Drupal\htm_custom_oska\Entity\OskaTableEntity;
use League\Csv\Writer;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessOskaTableData
 * @package Drupal\htm_custom_oska
 */
class ProcessInfographData {


  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static();
  }


  public static function ValidateFile($filename, $items, &$context){

    $message = t('Validating file');
    $results = [];
    $object = [
      'naitaja' => false,
    ];
    foreach ($items as $index => $item){

      foreach($item as $key => $value){
        if(mb_detect_encoding($key) == 'UTF-8'){
          $object[cleanString($key)] = $value;
        }else{
          $object[$key] = $value;
        }
      }

      if(!$object['naitaja']){
        $error_messag_func = function($values) {
          foreach($values as $key => $value){
            if($key === 'naitaja' && ($value === FALSE || $value === null)){
              return $key;
            }
          }
        };

        $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func($object));
      }else{
        $results[] = $object;
      }
    }

    $context['message'] = $message;
    $context['results']['values'] = $results;

    if(empty($context['results']['error'])){

      $logpath = '/app/drupal/web/sites/default/files/private/infograph';
      if(!file_exists($logpath)) mkdir($logpath, 0744, true);
      $writer = Writer::createFromPath($logpath.'/'.$filename.'.csv', 'w+');
      $writer->setDelimiter(';');
      $writer->insertOne(['naitaja', 'teema', 'aasta', 'silt', 'vaartus']);
      $writer->insertAll($results);
    }
  }

  public static function CreateGraphFilters($filename, $items, &$context){

    $filter_values = [];
    $hierarchy = [];

    //process only if no errors otherwise nothing
    if(empty($context['results']['error'])){
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['current_id'] = 0;
      $context['sandbox']['max'] = count($context['results']['values']);

      if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
        for($i = $context['sandbox']['current_id']; $i < $context['sandbox']['max']; $i++){

          $values = $context['results']['values'][$i];
          $indicator = $values['naitaja'];

          foreach($values as $key => $value){
            if(strlen(trim($value)) != 0){
              $filter_values[$key][$indicator][] = $value;
            }
          }

          $hierarchy['naitaja'][$indicator] = [
            'teema' => $values['teema'],
            'aasta' => $values['aasta'],
            'silt' => $values['silt']
          ];

          if($context['sandbox']['progress']+1 == $context['sandbox']['max']){
            foreach($filter_values as $key => $values){
              $logpath = '/app/drupal/web/sites/default/files/private/infograph_filters/'.$filename;
              if(!file_exists($logpath)) mkdir($logpath, 0744, true);
              $logpath .= '/'.$key;
              $file = fopen($logpath, 'wb');
              foreach($values as $label => $childs){
                $values[$label] = array_unique($childs);
              }
              fwrite($file, json_encode($values, TRUE));
            }

            // filter hierarchy for front-end
            $logpath = '/app/drupal/web/sites/default/files/private/infograph_filters/'.$filename;
            if(!file_exists($logpath)) mkdir($logpath, 0744, true);
            $logpath .= '/hierarchy';
            $file = fopen($logpath, 'wb');
            fwrite($file, json_encode($hierarchy, TRUE));

          }
          $context['sandbox']['progress']++;
          $context['sandbox']['current_id'] = $i;
          #$context['message'] = t('Processing lines : @limit - @current ', ['@limit' => $limit, '@current' => $context['sandbox']['current_id'] + 1]);
          $context['message'] = $context['sandbox']['max'];

          $context['results']['processed'][] = $i;

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

  public static function ProcessInfographDataFinishedCallback($success, $results, $operations){
    // The 'success' parameter means no fatal PHP errors were detected. All
    // other error management should be handled using 'results'.
    if ($success) {
      if(isset($results['error'])){
        $message = [implode(', ', $results['error']), 'error'];
      }else{
        $message = [\Drupal::translation()->formatPlural(
          count($results['processed']),
          'One infograph item processed.', '@count infograph items processed.'
        ), 'status'];
      }
    }
    else {
      $message = [t('Finished with an error.'), 'error'];
    }
    drupal_set_message($message[0], $message[1]);
  }
}
