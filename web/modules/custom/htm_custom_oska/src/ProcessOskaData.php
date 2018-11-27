<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\htm_custom_oska\Entity\OskaEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\taxonomy\Entity\Term;
use Drupal\node\Entity\Node;

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

        $results = [];
        $file_filters = [
            'year' => [],
            'oska_label' => []
        ];

        $object = [
            'naitaja' => false,
            'valdkond' => false,
            'alavaldkond' => false,
            'ametiala' => false,
            'periood' => false,
            'silt' => false,
            'vaartus' => false,
        ];

        foreach ($items as $index => $item){

            foreach($item as $key => $value){
                if(mb_detect_encoding($key) == 'UTF-8'){
                    unset($item[$key]);
                    $item[cleanString($key)] = $value;
                }
            }

            $object['naitaja'] = self::checkTaxonomyTerm('taxonomy_term', 'oska_indicator', $item['naitaja']);
            $object['valdkond'] = self::checkTaxonomyTerm('taxonomy_term', 'oska_field', $item['valdkond']);
            $object['alavaldkond'] = self::checkTaxonomyTerm('taxonomy_term', 'oska_field', $item['alavaldkond']);
            $object['ametiala'] = self::checkTaxonomyTerm('taxonomy_term', 'oska_main_profession', $item['ametiala']);
            $object['periood'] = $item['periood'];
            $object['silt'] = $item['silt'];
            $object['vaartus'] = $item['vaartus'];

            if(
            !$object['naitaja']){

                $error_messag_func = function($values) {
                    foreach($values as $key => $value){
                        if($key === 'naitaja' && $value === FALSE){
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
                    'oska_main_profession' => $object['ametiala'],
                    'year' => $object['periood'],
                    'oska_label' => $object['silt'],
                    'value' => $object['vaartus']
                ];

                if(!in_array($object['periood'], $file_filters['year'])){
                    $file_filters['year'][] = $object['periood'];
                }
                if(!in_array($object['silt'], $file_filters['oska_label'])){
                    $file_filters['oska_label'][] = $object['silt'];
                }
            }
        }

        self::addFiltersToFile($file_filters);

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

    public static function checkTaxonomyTerm($entity_type, $vocabulary, $name){

        if($name != ''){
            $storage = \Drupal::service('entity_type.manager')->getStorage($entity_type);

            $properties = [
                'vid' => $vocabulary,
                'name' => $name
            ];

            $results = $storage->loadByProperties($properties);

            if($results){
                $entity = $storage->loadByProperties($properties);
                if($entity){
                    $entity = reset($entity);
                }
            }
        }

        return isset($entity) ? $entity->id() : FALSE;
    }

    public static function addFiltersToFile($filter_values){

        foreach($filter_values as $key => $values){
            $values = array_unique($values);
            $logpath = '/app/drupal/web/sites/default/files/private/oska_filters';
            if(!file_exists($logpath)) mkdir($logpath, 0744, true);
            $logpath .= '/'.$key;
            $file = fopen($logpath, 'wb');
            $array_len = count($values)-1;
            foreach($values as $key => $val){
                if($key != $array_len){
                    fwrite($file, $val.PHP_EOL);
                }else{
                    fwrite($file, $val);
                }
            }
        }
    }

    public static function deleteNodes($nids, &$context){

        if(empty($context['sandbox'])){
            $context['sandbox']['progress'] = 0;
            $context['sandbox']['current_id'] = 0;
            $context['sandbox']['max'] = count($nids);
        }

        if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
            $limit = $context['sandbox']['current_id'] + 10;
            $nids = array_values($nids);
            for($i = $context['sandbox']['current_id']; $i < $limit; $i++){
                    $node = OskaEntity::load($nids[$i]);

                    if($node != null){
                        $node->delete();
                    }

                    $context['sandbox']['progress']++;
                    $context['sandbox']['current_id'] = $i;
                    $context['message'] = $context['sandbox']['max'];

                    $context['results']['processed'][] = $nids[$i];
            }

            $context['sandbox']['current_id']++;

            if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
                $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
            }
        }else{
            $context['finished'] = 1;
        }
    }

    public static function deleteNodesFinishedCallback($success, $results, $operations) {
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            $message = \Drupal::translation()->formatPlural(
                count($results),
                'One post processed.', '@count posts processed.'
            );
        }
        else {
            $message = t('Finished with an error.');
        }
        drupal_set_message($message);
    }
}