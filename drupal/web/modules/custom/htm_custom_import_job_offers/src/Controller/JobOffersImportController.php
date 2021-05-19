<?php

namespace Drupal\htm_custom_import_job_offers\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use GuzzleHttp\Exception\RequestException;

/**
* Class JobOffersImportController.
*/
class JobOffersImportController extends ControllerBase {

  public function import_offers() {

    $offers_education = $this->get_offers_data();
    $adrid_data = $this->get_adrid_data();
    $save_offers = $this->save_offers();
    $delete_offers = $this->delete_old_offers();

    return array('#markup' => 'teretere');
  }

  //----- Retrieve job offers data through töötukassa API
  public function get_offers_data(){

    $json_url = 'https://www.tootukassa.ee/api/toopakkumised';
    $client = \Drupal::httpClient();

    try{
      $response = $client->request('GET', $json_url);
    }
    catch(RequestException $e){
      $message = t('EHIS avaandmete päringu viga: @error', array('@error' => $e));
      \Drupal::service('htm_custom_file_logging.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }

    $data = $response->getBody();
    $data_from_json = json_decode($data, true);

    $offers_education = [];

    //-- Get all the offers from 'Haridus' field and return only the necessary data
    foreach($data_from_json as $key => $value){
      if($value['VALDKOND_NIMETUS'] === 'Haridus'){
        $offers_education[] = [
          'profession' => $value['NIMETUS'],
          'working_time' => [
            'full_time' => $value['ON_TAISKOHAGA'],
            'part_time' => $value['ON_OSAKOHAGA'],
            'in_shifts' => $value['ON_VAHETUSTEGA'],
            'at_night' => $value['ON_OOSITI'],
          ],
          'institution' => $value['ASUTUS_NIMI'],
          'application_date' => $value['KANDIDEERIMISE_KP'],
          'application_url' => $value['URL'],
          'application_id' => $value['TOOPAKKUMINE_NUMBER'],
          'address' => $value['ASUTUS_AADRESS']['TEKST'],
          'address_id' => $value['ASUTUS_AADRESS']['ADRID'],
        ];
      }
    }
    return $offers_education;
  }

  //----- Retrieve location information from Maaamet for each 'Haridus' offer
  public function get_adrid_data(){

    $offers_education = $this->get_offers_data();

    foreach($offers_education as $key => $adrid){
      // Get location data according to 'ADRID' field number
      if($adrid['address_id']) {
        $json_url = 'https://inaadress.maaamet.ee/inaadress/gazetteer?adrid='.$adrid['address_id'];
        $client = \Drupal::httpClient();

        try{
          $response = $client->request('GET', $json_url);
        }
        catch(RequestException $e){
          $message = t('EHIS avaandmete päringu viga: @error', array('@error' => $e));
          \Drupal::service('htm_custom_file_logging.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
        }

        $data = $response->getBody();
        $data_from_json = json_decode($data, true);

        // Add the location data to the according offer
        $map_coordinates = str_replace(' ','', explode(',',$data_from_json['addresses'][0]['g_boundingbox']));
        $offers_education[$key]['longitude'] = $map_coordinates[0];
        $offers_education[$key]['latitude'] = end($map_coordinates);
      }
    }
    return $offers_education;
  }

  //----- Save retrieved offers data to Drupal 'job_offer' node fields
  public function save_offers(){
    $offers_education = $this->get_adrid_data();

    //-- Check if the job offer with the id number retrieved from API data already exists in Drupal
    foreach($offers_education as $key => $single_offer){
      $nid_result = \Drupal::entityQuery('node')
        ->condition('field_id_number', $single_offer['application_id'])
        ->condition('type', 'job_offer')
        ->execute();

      //-- If no job offer with that id number exist, create a new offer
      if(empty($nid_result)) {
        // create location paragraph
        $paragraph_location = Paragraph::create([
          'type' => 'location',
          'field_address' => [
            'value' => sprintf($single_offer['address'])
          ],
          'field_long' => [
            'value' => sprintf($single_offer['longitude'])
          ],
          'field_lat' => [
            'value' => sprintf($single_offer['latitude'])
          ],
        ]);

        $paragraph_location->save();

        // create working time paragraph
        $paragraph_working_time = Paragraph::create([
          'type' => 'working_time',
          'field_full_time' => [
            'value' => (string) $single_offer['working_time']['full_time']
          ],
          'field_part_time' => [
            'value' => (string) $single_offer['working_time']['part_time']
          ],
          'field_in_shifts' => [
            'value' => (string) $single_offer['working_time']['in_shifts']
          ],
          'field_at_night' => [
            'value' => (string) $single_offer['working_time']['at_night']
          ],
        ]);

        $paragraph_working_time->save();

        // create a job offer node
        $node = Node::create([
          'type' => 'job_offer',
          'langcode' => 'et',
          'created' => REQUEST_TIME,
          'changed' => REQUEST_TIME,
          'uid' => 1,
          'title'=> sprintf('%s', $single_offer['profession']),
          'field_institution'=> [
            'value' => sprintf('%s', $single_offer['institution'])
          ],
          'field_adrid'=> [
            'value' => sprintf('%s', $single_offer['address_id'])
          ],
          'field_id_number'=> [
            'value' => sprintf('%s', $single_offer['application_id'])
          ],
          'field_webpage_link'=> [
            'uri' => sprintf('%s', $single_offer['application_url']),
          ],
          'field_date'=> [
            'value' => strtotime($single_offer['application_date'])
          ],
          'field_location'=> [
            'target_id' => $paragraph_location->id(),
            'target_revision_id' => $paragraph_location->getRevisionId(),
          ],
          'field_time'=> [
            'target_id' => $paragraph_working_time->id(),
            'target_revision_id' => $paragraph_working_time->getRevisionId(),
          ],
        ]);

        $node->save();

        //-- If a job offer with that id already exists then update it
      } else {
        $node = Node::load(array_values($nid_result)[0]);

        // update location paragraph
        $paragraph_location_entity = $node->get('field_location')->referencedEntities();
        $paragraph_location = Paragraph::load($paragraph_location_entity[0]->id());
        $paragraph_location->set('field_address', $single_offer['address']);
        $paragraph_location->set('field_long', $single_offer['longitude']);
        $paragraph_location->set('field_lat', $single_offer['latitude']);
        $paragraph_location->save();
        $paragraph_location_items[] = [
          'target_id' => $paragraph_location->id(),
          'target_revision_id' => $paragraph_location->getRevisionId(),
        ];

        // update working time paragraph
        $paragraph_time_entity = $node->get('field_time')->referencedEntities();
        $paragraph_time = Paragraph::load($paragraph_time_entity[0]->id());
        $paragraph_time->set('field_full_time', $single_offer['working_time']['full_time']);
        $paragraph_time->set('field_part_time', $single_offer['working_time']['part_time']);
        $paragraph_time->set('field_in_shifts', $single_offer['working_time']['in_shifts']);
        $paragraph_time->set('field_at_night', $single_offer['working_time']['at_night']);
        $paragraph_time->save();
        $paragraph_time_items[] = [
          'target_id' => $paragraph_time->id(),
          'target_revision_id' => $paragraph_time->getRevisionId(),
        ];

        // update the node fields
        $node->set('title', $single_offer['profession']);
        $node->set('field_institution', $single_offer['institution']);
        $node->set('field_adrid', $single_offer['address_id']);
        $node->set('field_id_number', $single_offer['application_id']);
        $node->set('field_webpage_link', $single_offer['application_url']);
        $node->set('field_date', strtotime($single_offer['application_date']));
        $node->set('field_location', $paragraph_location_items);
        $node->set('field_time', $paragraph_time_items);

        $node->save();
      }
    }
  }

  //----- Delete the offers with the expired application date
  public function delete_old_offers(){
    $offer_ids = [];
    $nid_result = \Drupal::entityQuery('node')
      ->condition('type', 'job_offer')
      ->execute();

    foreach($nid_result as $nodeid){
      $node = Node::load($nodeid);
      $offer_item = entity_load('node', $nodeid);
      $offer_ids[$nodeid] = $offer_item->get('field_date')->getValue()[0]['value'];
      $offer_end_time = date('Y/m/d', $offer_ids[$nodeid]);
      $current_time = date('Y/m/d', \Drupal::time()->getCurrentTime());
      if($offer_end_time < $current_time) {
        $node->delete();
      }
    }
  }

//  public function get_existing_offer_ids(){
//    $offer_ids = [];
//    $nid_result = \Drupal::entityQuery('node')
//      ->condition('type', 'job_offer')
//      ->execute();
//
//    foreach($nid_result as $nodeid){
//      $offer_item = entity_load('node', $nodeid);
//      $offer_ids[$nodeid] = $offer_item->get('field_id_number')->getValue()[0]['value'];
//    }
//    return $offer_ids;
//  }
//
//  public function check_offer_existance(){
//
//    $offers_education = $this->get_adrid_data();
//    $offers_ids = $this->get_existing_offer_ids();
//
//    // check if any if API job offer id === existing job offer id
//    foreach ($offers_education as $key => $value) {
//      if($value['application_id']) {
//        foreach($offers_ids as $offer => $id) {
//          if($value['application_id'] === $id) {
//            // update node
//            $action = 'update';
//          } else {
//            // create new node
//            $action = 'create';
//          }
//        }
//      }
//    }
//  }

}
