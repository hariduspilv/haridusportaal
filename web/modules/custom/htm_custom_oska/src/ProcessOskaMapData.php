<?php

namespace Drupal\htm_custom_oska;

use Drupal\htm_custom_oska\Entity\OskaFillingBarEntity;
use Symfony\Component\DependencyInjection\ContainerInterface;
use League\Csv\Writer;

/**
 * Class ProcessOskaMapData
 * @package Drupal\htm_custom_oska
 */
class ProcessOskaMapData {


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
            'maakond' => false,
            'valdlinn' => false,
            'vaartus' => false,
            'jaotus' => false
        ];

        foreach ($items as $index => $item){

            foreach($item as $key => $value){
                if(mb_detect_encoding($key) == 'UTF-8'){
                    unset($item[$key]);
                    $item[cleanString($key)] = $value;
                }
            }

            $object['naitaja'] = $item['naitaja'] != '' && is_string($item['naitaja']) ? $item['naitaja'] : FALSE;
            $object['valdkond'] = $item['valdkond'];
            $object['maakond'] = $item['maakond'];
            $object['valdlinn'] = $item['valdlinn'];
            $object['vaartus'] = $item['vaartus'] != '' ? floatval(str_replace(',','.', $item['vaartus'])) : FALSE;
            $object['jaotus'] = $item['jaotus'] >= 1 && $item['jaotus'] <= 7 ? $item['jaotus'] : FALSE;
            if(
                !$object['naitaja']
                ||
                $object['vaartus'] === FALSE
                ||
                !$object['jaotus']){

                $error_messag_func = function($values) {
                    foreach($values as $key => $value){
                        if($value === FALSE){
                            return t('Missing ').$key;
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
        $context['results']['processed'] = 0;

        if(empty($context['results']['error'])){

            $logpath = '/app/drupal/web/sites/default/files/private/oska_csv';
            if(!file_exists($logpath)) mkdir($logpath, 0744, true);
            $writer = Writer::createFromPath('/app/drupal/web/sites/default/files/private/oska_csv/oska_map_csv.csv', 'w+');
            $writer->setDelimiter(';');
            $writer->insertOne(['naitaja', 'valdkond', 'maakond', 'valdlinn', 'väärtus', 'jaotus']);
            $writer->insertAll($results);
            $context['results']['processed'] = $results;
        }
    }

    public static function ProcessOskaMapDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [\Drupal::translation()->formatPlural(
                    count($results['processed']),
                    'One oska map item processed.', '@count oska map items processed.'
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
}