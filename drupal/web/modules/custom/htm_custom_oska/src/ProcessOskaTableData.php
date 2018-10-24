<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\htm_custom_oska\Entity\OskaTableEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Class ProcessOskaTableData
 * @package Drupal\htm_custom_oska
 */
class ProcessOskaTableData {


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
            'valdkond' => false,
        ];
        foreach ($items as $index => $item){
            $object['valdkond'] = self::checkEntityReference('node', 'oska_field_page', $item['valdkond']);
            $object['juurprobleem'] = strlen($item['juurprobleem']) <= 500 ? $item['juurprobleem'] : FALSE;
            $object['ettepanek'] = strlen($item['ettepanek']) <= 500 ? $item['ettepanek'] : FALSE;
            $object['peavastutaja'] = strlen($item['peavastutaja']) <= 50 ? $item['peavastutaja'] : FALSE;
            $object['staatus'] = strlen($item['staatus']) <= 50 ? $item['staatus'] : FALSE;
            $object['kommentaar'] = strlen($item['kommentaar']) <= 500 ? $item['kommentaar'] : FALSE;

            if(
                !$object['valdkond']
                ||
                !$object['juurprobleem']
                ||
                !$object['ettepanek']
                ||
                !$object['peavastutaja']
                ||
                !$object['staatus']
                ||
                !$object['kommentaar']){

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
                    'oska_field' => $object['valdkond'],
                    'problem_description' => $object['juurprobleem'],
                    'proposal' => $object['ettepanek'],
                    'responsible' => $object['peavastutaja'],
                    'proposal_status' => $object['staatus'],
                    'expert_commentary' => $object['kommentaar'],

                ];
            }
        }

        $context['message'] = $message;
        $context['results']['values'] = $results;
    }

    public static function ProcessOskaTableData($items, &$context){
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
                        $entity = OskaTableEntity::create($values);
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

    public static function ProcessOskaTableDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [\Drupal::translation()->formatPlural(
                    count($results['processed']),
                    'One oska table item processed.', '@count oska table items processed.'
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
        $ids = \Drupal::entityQuery('oska_table_entity')->execute();
        $storage_handler = \Drupal::entityTypeManager()->getStorage('oska_table_entity');
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