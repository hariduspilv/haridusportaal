<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\htm_custom_oska\Entity\OskaFillingBarEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessOskaFillingBarData
 * @package Drupal\htm_custom_oska
 */
class ProcessOskaFillingBarData {


    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        return new static();
    }


    public static function ValidateFile($items, &$context){
        $message = t('Validating file');

        $results = [];
        $object = [
            'ametiala' => false,
            'vaartus' => false,
        ];

        foreach ($items as $index => $item){

            foreach($item as $key => $value){
                if(mb_detect_encoding($key) == 'UTF-8'){
                    unset($item[$key]);
                    $item[cleanString($key)] = $value;
                }
            }

            $object['ametiala'] = self::checkEntityReference('node', 'oska_main_profession_page', $item['ametiala']);
            $object['vaartus'] = $item['vaartus'] >= 1 && $item['vaartus'] <= 5 ? $item['vaartus'] : FALSE;
            if(
                !$object['ametiala']
                ||
                !$object['vaartus']){

                $error_messag_func = function($values) {
                    foreach($values as $key => $value){
                        if($value === FALSE){
                            return t('Missing ').$key;
                        }
                    }
                };
                $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func($object));
            }else{
                $results[] = [
                    'oska_main_profession' => $object['ametiala'],
                    'value' => $object['vaartus']
                ];
            }
        }

        $context['message'] = $message;
        $context['results']['values'] = $results;
    }

    public static function ClearOldValues($items, &$context){

      if(empty($context['results']['error'])) {
        dump('sagfsa');
      }
      dump(empty($context['results']['error']));
      die();

      if(empty($context['results']['error'])){
        $nids = \Drupal::entityQuery('node')
          ->condition('type', 'oska_main_profession_page')
          ->execute();
        $storage = \Drupal::entityTypeManager()->getStorage('node');

        foreach($nids as $nid){
          $entity = $storage->load($nid);
          $entity->set('field_filling_bar', 0);
          $entity->save();
        }
      }
    }

    public static function ProcessOskaFillingBarData($items, &$context){
        //process only if no errors otherwise nothing
        if(empty($context['results']['error'])){
            if(empty($context['sandbox'])){
                $context['sandbox']['progress'] = 0;
                $context['sandbox']['current_id'] = 0;
                $context['sandbox']['max'] = count($context['results']['values']);
            }

            if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
                $limit = $context['sandbox']['current_id'] + 10;
                if ($context['sandbox']['max'] - $context['sandbox']['current_id'] < 10){
                    $limit = $context['sandbox']['max'];
                }
                for($i = $context['sandbox']['current_id']; $i < $limit; $i++){
                    // do something
                    $values = $context['results']['values'][$i];
                    if($values){
                        $entity = OskaFillingBarEntity::create($values);
                    }
                    $entity->save();

                    $main_profession_page = \Drupal::entityTypeManager()->getStorage('node')->load($values['oska_main_profession']);
                    $main_profession_page->set('field_filling_bar', $values['value']);
                    $main_profession_page->save();

                    $context['sandbox']['progress']++;
                    $context['sandbox']['current_id'] = $i;
                    #$context['message'] = t('Processing lines : @limit - @current ', ['@limit' => $limit, '@current' => $context['sandbox']['current_id'] + 1]);
                    $context['message'] = $context['sandbox']['max'];

                    $context['results']['processed'][] = $entity->id();
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

    public static function ProcessOskaFillingBarDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [\Drupal::translation()->formatPlural(
                    count($results['processed']),
                    'One oska filling bar item processed.', '@count oska filling bar items processed.'
                ), 'status'];
            }
        }
        else {
            $message = [t('Finished with an error.'), 'error'];
        }
        drupal_set_message($message[0], $message[1]);
    }

    public static function checkEntityReference($entity_type, $vocabulary, $name){

        $storage = \Drupal::entityTypeManager()->getStorage($entity_type);

        $properties = [
            'type' => $vocabulary,
            'title' => $name
        ];

        $result = $storage->loadByProperties($properties);

        if($result){
            $entity = reset($result);
        }

        return isset($entity) ? $entity->id() : FALSE;
    }
}
