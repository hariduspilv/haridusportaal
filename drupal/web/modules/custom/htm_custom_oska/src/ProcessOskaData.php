<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\htm_custom_oska\Entity\OskaEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\Entity\Term;

/**
 * Class ProcessOskaData
 * @package Drupal\htm_custom_oska
 */
class ProcessOskaData {


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
            'valdkond' => false,
            'alavaldkond' => false,
            'pohikutseala' => false,
            'aasta' => false,
            'silt' => false,
            'vaartus' => false,
        ];

        foreach ($items as $index => $item){
            $object['naitaja'] = self::addTaxonomyTerm('taxonomy_term', 'oska_indicator', $item['naitaja']);
            $object['valdkond'] = self::checkTaxonomyTerm('taxonomy_term', 'oska_field', $item['valdkond']);
            $object['alavaldkond'] = self::addTaxonomyTerm('taxonomy_term', 'oska_field', $item['alavaldkond'], $item['valdkond']);
            $object['pohikutseala'] = self::checkTaxonomyTerm('taxonomy_term', 'oska_main_profession', $item['pohikutseala']);
            $object['aasta'] = strlen($item['aasta'])==4 && is_numeric($item['aasta']) ? $item['aasta'] : FALSE;
            $object['silt'] = is_string($item['silt']) ? $item['silt'] : FALSE;
            $object['vaartus'] = is_numeric($item['vaartus']) ? $item['vaartus'] : FALSE;
            if(
                !$object['naitaja']
                ||
                !$object['aasta']
                ||
                !$object['silt']
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
                    'oska_field' => $object['valdkond'],
                    'oska_sub_field' => $object['alavaldkond'],
                    'oska_main_profession' => $object['pohikutseala'],
                    'year' => $object['aasta'],
                    'oska_label' => $object['silt'],
                    'value' => $object['vaartus']
                ];
            }
        }

        $context['message'] = $message;
        $context['results']['values'] = $results;
    }

    public static function ProcessOskaData($items, &$context){
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
                        $entity = OskaEntity::create($values);
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

    public static function ProcessOskaDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [\Drupal::translation()->formatPlural(
                    count($results['processed']),
                    'One oska item processed.', '@count oska items processed.'
                ), 'status'];
            }
        }
        else {
            $message = [t('Finished with an error.'), 'error'];
        }
        drupal_set_message($message[0], $message[1]);
    }

    public function addTaxonomyTerm($entity_type, $vocabulary, $name){

        $storage = \Drupal::service('entity_type.manager')->getStorage($entity_type);

        $properties = [
            'vid' => $vocabulary,
            'name' => $name
        ];

        $entity = reset($storage->loadByProperties($properties));
        if(!$entity){
            $entity = Term::create([
                'name' => $name,
                'vid' => $vocabulary,
            ]);
            $entity->save();
        }
        return ($entity) ? $entity->id() : '';
    }

    public function checkTaxonomyTerm($entity_type, $vocabulary, $name){

        $storage = \Drupal::service('entity_type.manager')->getStorage($entity_type);

        $properties = [
            'vid' => $vocabulary,
            'name' => $name
        ];

        $entity = reset($storage->loadByProperties($properties));

        return ($entity) ? $entity->id() : '';
    }

    private function deleteAllEntities(){
        $ids = \Drupal::entityQuery('oska_entity')->execute();
        $storage_handler = \Drupal::entityTypeManager()->getStorage('oska_entity');
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