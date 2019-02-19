<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\htm_custom_oska\Entity\OskaIndicatorEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessOskaIndicatorData
 * @package Drupal\htm_custom_oska
 */
class ProcessOskaIndicatorData {


    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        return new static();
    }


    public static function ValidateFile($items, &$context){
        $message = t('Validating file');

        //first delete all subsidies
        self::deleteAllEntities();

        #dump(self::$k['EHIS_ID']);
        $results = [];
        $object = [
            'id' => false,
            'naitaja' => false,
            'ametiala' => false,
            'vaartus' => false,
            'ikoon' => false,
        ];
        $required_fields = [
            'id', 'naitaja', 'vaartus', 'ikoon'
        ];

        foreach ($items as $index => $item){

            foreach($item as $key => $value){
                if(mb_detect_encoding($key) == 'UTF-8'){
                    unset($item[$key]);
                    $item[cleanString($key)] = $value;
                }
            }

            $object['id'] = $item['id'] != '' && is_numeric($item['id']) ? $item['id'] : FALSE;
            $object['naitaja'] = $item['naitaja'] != '' && is_string($item['naitaja']) ? $item['naitaja'] : FALSE;
            $object['ametiala'] = self::checkEntityReference('node', 'oska_main_profession_page', $item['ametiala']);
            $object['vaartus'] = $item['vaartus'] != '' ? $item['vaartus'] : FALSE;
            $object['ikoon'] = $item['ikoon'] != '' && is_numeric($item['ikoon']) ? $item['ikoon'] : FALSE;

            if(
                !$object['id']
                ||
                !$object['naitaja']
                ||
                !$object['vaartus']
                ||
                !$object['ikoon']){

                $error_messag_func = function($values, $required_fields) {
                    foreach($values as $key => $value){
                        if(in_array($key, $required_fields) && $value === FALSE){
                            return t('Missing ').$key;
                        }
                    }
                };
                $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func($object, $required_fields));
            }elseif(!$object['ametiala']){
                continue;
            }else{
                $results[] = [
                    'oska_id' => $object['id'],
                    'oska_indicator' => $object['naitaja'],
                    'oska_main_profession' => $object['ametiala'],
                    'value' => $object['vaartus'],
                    'icon' => $object['ikoon']
                ];
            }
        }

        $context['message'] = $message;
        $context['results']['values'] = $results;
    }

    public static function ProcessOskaIndicatorData($items, &$context){
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
                    $limit = $context['sandbox']['max'] + 1;
                }
                for($i = $context['sandbox']['current_id']; $i < $limit; $i++){
                    // do something
                    $values = $context['results']['values'][$i];
                    if($values){
                        $entity = OskaIndicatorEntity::create($values);
                    }

                    $entity->save();
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

    public static function ProcessOskaIndicatorDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [\Drupal::translation()->formatPlural(
                    count($results['processed']),
                    'One oska indicator processed.', '@count oska indicators processed.'
                ), 'status'];
            }
        }
        else {
            $message = [t('Finished with an error.'), 'error'];
        }
        drupal_set_message($message[0], $message[1]);
    }

    public function checkEntityReference($entity_type, $vocabulary, $name){

        $storage = \Drupal::service('entity_type.manager')->getStorage($entity_type);

        $properties = [
            'type' => $vocabulary,
            'title' => $name
        ];

        $entity = reset($storage->loadByProperties($properties));

        return ($entity) ? $entity->id() : FALSE;
    }

    private function deleteAllEntities(){
        $ids = \Drupal::entityQuery('oska_indicator_entity')->execute();
        $storage_handler = \Drupal::entityTypeManager()->getStorage('oska_indicator_entity');
        $entities = $storage_handler->loadMultiple($ids);
        $storage_handler->delete($entities);
    }
}