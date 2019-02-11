<?php

namespace Drupal\htm_custom_juhan_import\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

/**
 * Class ImportController.
 */
class ImportController extends ControllerBase {

    public function import() {

        $data = $this->get_public_trainings();
        $nodes = $this->create_queue_items($data);

        return $nodes;
    }

    public function get_public_trainings(){
        $json_url = 'https://koolitus.hitsa.ee/api/public/trainings';

        $client = \Drupal::httpClient();

        try{
            $response = $client->request('GET', $json_url);
        }
        catch(RequestException $e){
            $message = t('Getting data from JUHAN failed: @error', array('@error' => $e));
            \Drupal::service('custom_logging_to_file.write')->write('error', 'JUHAN import', $message);
        }

        $data = json_decode($response->getBody()->getContents());

        return $data;
    }

    public function create_queue_items($data){

        $queue_items = [];

        // create default event type taxonomy, if not already created
        $event_type = $this->create_event_type_taxonomy('event_type', 'Koolitus');

        // go through each imported data and look, if it exists
        foreach($data as $item){

            $result = \Drupal::entityQuery('node')
                ->condition('field_external_id', $item->id)
                ->condition('type', 'event')
                ->execute();

            $result = reset($result);

            #if(isset($item->venueFullAddress) && $item->venueFullAddress != ''){
            #$response = \Drupal::httpClient()->request('GET', 'https://inaadress.maaamet.ee/inaadress/gazetteer?address='.$item->venueFullAddress);
            #$address = $response->getBody();
            #}

            $queue_items[] = [
                'nid' => $result,
                'status' => '1',
                'field_external_id' => $item->id,
                'title' => $item->courseDescription->trainingName,
                'field_description_summary' => $item->courseDescription->lead,
                'field_event_type' => $event_type,
                'field_description' => strip_tags($item->courseDescription->fullDescription),
                'field_event_link' => [
                    'uri' => $item->publicUrl,
                    'title' => 'Täpsem info täienduskoolituste infosüsteemis'
                ],
                'field_registration_url' => $item->publicUrl,
                'field_event_location' => [
                    'name' => isset($item->venueFullAddress) ? $item->venueFullAddress : '',
                ],
                'field_organizer' => isset($item->institution) ? $item->institution->name : '',
                'field_contact_person' => $item->projectManager->projectManagerFullName,
                'field_contact_phone' => $item->projectManager->phone,
                'field_contact_email' => $item->projectManager->email,
                'field_entry_type' => 'juhan',
                'field_practical_information' => $item->venueInfo,
                'field_event_main_date' => $item->startingDate,
                'field_event_main_end_date' => $item->endingDate
            ];

        }

        // get unused id's
        $queue_items = $this->get_unpublish_nodes($data, $queue_items);

        return $queue_items;

    }

    public function create_event_type_taxonomy($vid, $title){

        $termid = \Drupal::entityQuery('taxonomy_term')
            ->condition('vid', $vid)
            ->condition('name', $title)
            ->execute();

        $termid = reset($termid);

        if(!empty($termid)){

            return $termid;
        }else{
            $term = Term::create([
                'name' => $title,
                'vid' => $vid,
            ]);
            $term->save();

            return $term->id();
        }
    }

    public function get_unpublish_nodes($data, $nodes){

        $juhan_ids = [];

        // get all juhan id's
        foreach($data as $item){
            $juhan_ids[] = $item->id;
        }

        $unpublish_ids = \Drupal::entityQuery('node')
            ->condition('field_external_id', $juhan_ids, 'NOT IN')
            ->condition('field_entry_type', 'juhan')
            ->condition('type', 'event')
            ->execute();

        foreach($unpublish_ids as $id){
            $nodes[] = [
                'nid' => $id,
                'status' => '0'
            ];
        }

        return $nodes;
    }

    public function save_event($event){

        if($event['nid'] != ''){
            $node = Node::load($event['nid']);

            foreach($event as $field => $value){
                $node->set($field, $value);
            }
        }else{
            unset($event['nid']);

            $node = Node::create([
                'type' => 'event',
                'langcode' => 'et',
                'created' => \Drupal::time()->getRequestTime(),
                'changed' => \Drupal::time()->getRequestTime(),
                'uid' => 1,
            ]);

            foreach($event as $field => $value){
                $node->set($field, $value);
            }
        }

        $node->save();
    }
}
