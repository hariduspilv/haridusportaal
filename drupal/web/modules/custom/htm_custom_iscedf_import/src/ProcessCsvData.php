<?php

namespace Drupal\htm_custom_iscedf_import;

use Symfony\Component\DependencyInjection\ContainerInterface;
use League\Csv\Writer;
use Drupal\taxonomy\Entity\Term;

/**
 * Class ProcessCsvData
 * @package Drupal\htm_custom_iscedf_import
 */
class ProcessCsvData {

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        return new static();
    }


    public static function validateFile($items, &$context){
        $message = t('Validating file');

        $results = [];

        $object = [
            'detailedCode' => false,
            'detailedLabel' => false,
            'narrowCode' => false,
            'narrowLabel' => false,
            'broadCode' => false,
            'broadLabel' => false
        ];

        foreach ($items as $index => $item){

            foreach($item as $key => $value){
                if(mb_detect_encoding($key) == 'UTF-8'){
                    $object[cleanString($key)] = $value;
                }else{
                    $object[$key] = $value;
                }
            }

            if(in_array(false, $object)){

                $error_messag_func = function($values) {
                    foreach($values as $key => $value){
                        if($value === FALSE){
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
    }

    public static function importData($items, &$context){
        $levels = [
            "broad",
            "narrow",
            "detailed"
        ];
        //process only if no errors otherwise nothing
        if(empty($context['results']['error'])){
            $context['sandbox']['progress'] = 0;
            $context['sandbox']['current_id'] = 0;
            $context['sandbox']['max'] = count($context['results']['values']);

            if($context['sandbox']['current_id'] <= $context['sandbox']['max']){
                for($i = $context['sandbox']['current_id']; $i < $context['sandbox']['max']; $i++){

                    $values = $context['results']['values'][$i];

                    self::createTerms($values, $levels);

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

    public function createTerms($values, $levels){

        $term = null;

        foreach($levels as $level => $name){
            $query = \Drupal::entityQuery('taxonomy_term')
                ->condition('vid', 'isced_f')
                ->condition('name', $values[$name.'Label'])
                ->condition('field_code', $values[$name.'Code']);

            if($level > 0){
                $query->condition('parent', $term->id());
            }
            $term_id = $query->execute();

            if(count($term_id) > 0){
                $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load(reset($term_id));
            }else{

                $data = [
                    'name' => $values[$name.'Label'],
                    'vid' => 'isced_f',
                    'field_code' => $values[$name.'Code'],
                ];

                if($level > 0){
                    $data['parent'] = $term->id();
                }

                $term = Term::create($data);
                $term->save();
            }
        }



        if(count($term_id) > 0){
            $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load(reset($term_id));
        }else{
            $term = Term::create([
                'name' => $values['broadLabel'],
                'vid' => 'isced_',
                'field_code' => $values['broadCode'],
            ]);
            $term->save();
        }

        return $term;
    }

    public static function ProcessCsvDataFinishedCallback($success, $results, $operations){
        // The 'success' parameter means no fatal PHP errors were detected. All
        // other error management should be handled using 'results'.
        if ($success) {
            if(isset($results['error'])){
                $message = [implode(', ', $results['error']), 'error'];
            }else{
                $message = [t('ISCEDF CSV imported'), 'status'];
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