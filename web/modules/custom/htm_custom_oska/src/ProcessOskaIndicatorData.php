<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\htm_custom_oska\Entity\OskaIndicatorEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\Entity\Term;

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
            'naitaja' => false,
            'pohikutseala' => false,
            'vaartus' => false,
        ];

        foreach ($items as $index => $item){
            $object['naitaja'] = is_string($item['naitaja']) ? $item['naitaja'] : FALSE;;
            $object['pohikutseala'] = self::checkEntityReference('node', 'oska_main_profession_page', $item['pohikutseala']);
            $object['vaartus'] = is_numeric($item['vaartus']) ? $item['vaartus'] : FALSE;
            if(
                !$object['naitaja']
                ||
                !$object['pohikutseala']
                ||
                !$object['vaartus']){

                $error_messag_func = function($values) {
                    foreach($values as $key => $value){
                        if($value === FALSE){
                            return $key;
                        }
                    }
                };

                $context['results']['error'][] = t('Error on line: '. ($index + 2) . ' | column: ' . $error_messag_func($object));
            }else{
                $results[] = [
                    'oska_indicator' => $object['naitaja'],
                    'oska_main_profession' => $object['pohikutseala'],
                    'value' => $object['vaartus']
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

        return ($entity) ? $entity->id() : '';
    }

    private function deleteAllEntities(){
        $ids = \Drupal::entityQuery('oska_indicator_entity')->execute();
        $storage_handler = \Drupal::entityTypeManager()->getStorage('oska_indicator_entity');
        $entities = $storage_handler->loadMultiple($ids);
        $storage_handler->delete($entities);
    }

    private function checkDateFormat($date_string, $format){
        try{
            $d = DrupalDateTime::createFromFormat($format, $date_string);
            return $d->format('Y-m-d');
        }catch (\Exception $e){
            return false;
        }
    }
}