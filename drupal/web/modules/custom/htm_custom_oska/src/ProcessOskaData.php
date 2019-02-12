<?php

namespace Drupal\htm_custom_oska;

use Symfony\Component\DependencyInjection\ContainerInterface;
use League\Csv\Writer;

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
                    $object[cleanString($key)] = $value;
                }else{
                    $object[$key] = $value;
                }
            }

            if(!$object['naitaja']){

                $error_messag_func = function($values) {
                    foreach($values as $key => $value){
                        if($key === 'naitaja' && $value === FALSE){
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

            $logpath = '/app/drupal/web/sites/default/files/private/oska_csv';
            if(!file_exists($logpath)) mkdir($logpath, 0744, true);
            $writer = Writer::createFromPath('/app/drupal/web/sites/default/files/private/oska_csv/oska_csv.csv', 'w+');
            $writer->setDelimiter(';');
            $writer->insertOne(['naitaja', 'valdkond', 'alavaldkond', 'ametiala', 'periood', 'silt', 'vaartus']);
            $writer->insertAll($results);
        }
    }

    public static function DeleteOldData($items, &$context){

        $storage = \Drupal::entityTypeManager()->getStorage('oska_entity');
        $nids = \Drupal::entityQuery('oska_entity')->execute();
        $entities = $storage->loadMultiple($nids);
        $storage->delete($entities);

    }

    public static function CreateOskaFilters($items, &$context){

        $filter_values = [];
        $hierarchy = [];

        //process only if no errors otherwise nothing
        if(empty($context['results']['error'])){
            $context['sandbox']['progress'] = 0;
            $context['sandbox']['current_id'] = 0;
            $context['sandbox']['max'] = count($context['results']['values']);

            if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
                for($i = $context['sandbox']['current_id']; $i <= $context['sandbox']['max']; $i++){

                    $values = $context['results']['values'][$i];
                    $indicator = $values['naitaja'];

                    foreach($values as $key => $value){
                        if(!in_array($value, $filter_values[$key][$indicator]) && strlen(trim($value)) != 0){
                            $filter_values[$key][$indicator][] = $value;
                        }
                    }

                    $hierarchy['naitaja'][$indicator]['valdkond'][$values['valdkond']] = [
                        'alavaldkond' => $values['alavaldkond'],
                        'ametiala' => $values['ametiala'],
                        'periood' => $values['periood'],
                        'silt' => $values['silt']
                    ];

                    if($context['sandbox']['progress']+1 == $context['sandbox']['max']){
                        foreach($filter_values as $key => $values){
                            $logpath = '/app/drupal/web/sites/default/files/private/oska_filters';
                            if(!file_exists($logpath)) mkdir($logpath, 0744, true);
                            $logpath .= '/'.$key;
                            $file = fopen($logpath, 'wb');
                            foreach($values as $label => $childs){
                                $values[$label] = array_unique($childs);
                            }
                            fwrite($file, json_encode($values, TRUE));
                        }

                        // filter hierarchy for front-end
                        $logpath = '/app/drupal/web/sites/default/files/private/oska_filters';
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

    public static function ProcessOskaDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [t('OSKA CSV imported'), 'status'];
            }
        }
        else {
            $message = [t('Finished with an error.'), 'error'];
        }
        drupal_set_message($message[0], $message[1]);
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