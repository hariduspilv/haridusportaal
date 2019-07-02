<?php

namespace Drupal\htm_custom_elasticsearch_reindex;

use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class ProcessIndexes
 * @package Drupal\htm_custom_elasticsearch_reindex
 */
class ProcessIndexes {


    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container) {
        return new static();
    }


    public static function ResaveIndexes($items, &$context){
        $message = t('Resaving Indexes');
        $context['results']['values'] = 0;

        $server_storage = \Drupal::entityTypeManager()->getStorage('search_api_server')->loadMultiple();

        foreach($items as $server => $indexes){
            $loaded_indexes = $server_storage[$server]->getIndexes(['id' => $indexes]);
            foreach($loaded_indexes as $index){
                $index->save();
                $index->reindex();
                $context['results']['values']++;
            }
        }

        $context['message'] = $message;
    }

    public static function RebuildIndexes($items, &$context){

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
                $server_storage = \Drupal::entityTypeManager()->getStorage('search_api_server')->loadMultiple();
                foreach($items as $server => $indexes){
                    $loaded_indexes = $server_storage[$server]->getIndexes(['id' => $indexes]);
                    foreach($loaded_indexes as $index){
                        $index->indexItems();
                        $context['sandbox']['progress']++;
                        $context['sandbox']['current_id'] = $context['sandbox']['current_id'];
                        $context['message'] = $context['sandbox']['max'];
                        $context['results']['processed'][] = $index->id();
                    }
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

    public static function ProcessIndexesFinishedCallback($success, $results, $operations){
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
}