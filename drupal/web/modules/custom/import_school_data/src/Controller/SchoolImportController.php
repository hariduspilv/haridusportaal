<?php

namespace Drupal\import_school_data\Controller;

use Drupal\ckeditor_iframe\Plugin\CKEditorPlugin\IFrame;
use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
use Drupal\paragraphs\Entity\Paragraph;
use GuzzleHttp\Exception\RequestException;

/**
* Class SchoolImportController.
*/
class SchoolImportController extends ControllerBase {

  public function import() {
    $schoolnodes = [];
    $retrieved_ehis_ids = [];
    $schools = $this->get_school_data('school');
    $school_nodes = $this->getSchoolOpenNodes();
    $update_from_ehis_nodes = $this->get_ehis_updateable_nodes();
    $update_location_from_ehis_nodes = $this->get_ehis_location_updateable_nodes();
    $ownershiptypes = $this->get_taxonomy_terms('ownership_type');
    $teachinglanguages = $this->get_taxonomy_terms('teaching_language');
    $schooltypes = $this->get_taxonomy_ehis_outputs('educational_institution_type');
    $existing_ehis_ids = $this->get_existing_ehis_ids();
    foreach($schools as $school){
      $schoolnode['node_response'] = $this->check_school_existance($school, $update_from_ehis_nodes, $update_location_from_ehis_nodes);
      if($schoolnode['node_response']['school_field']['field_update_from_ehis'] === '1'){
        $schoolnode['edited_node'] = $this->add_school_fields($school, $schoolnode['node_response'], $ownershiptypes, $teachinglanguages, $schooltypes,$school_nodes);
        $schoolnodes[] = $schoolnode['edited_node'];
      }
      $retrieved_ehis_ids[$school->koolId] = '';
    }
    $unused_ehis_ids = $this->get_unused_ehis_ids($existing_ehis_ids, $retrieved_ehis_ids);
    foreach($unused_ehis_ids as $id){
      $schoolnode['edited_node'] = $this->unpublish_school($id);
      $schoolnodes[] = $schoolnode['edited_node'];
    }
    return $schoolnodes;
  }

  public function get_school_data($type){
    switch($type){
      case 'school':
      $json_url = 'http://enda.ehis.ee/avaandmed/rest/oppeasutused/-/-/-/-/-/-/-/-/-/-/-/1/JSON';
      break;
      default:
      return [];
    }

    $client = \Drupal::httpClient();
    try{
      $response = $client->request('GET', $json_url);
    }
    catch(RequestException $e){
      $message = t('EHIS avaandmete päringu viga: @error', array('@error' => $e));
      \Drupal::service('htm_custom_file_logging.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }

    $data = $response->getBody();
    $data_from_json = json_decode($data->getContents());
    $schools = $data_from_json->body->oppeasutused->oppeasutus;
    foreach($schools as $key => $school){
      if(!isset($school->regNr) || !isset($school->nimetus)){
        unset($schools[$key]);
        $message = t('Puuduvad kohustuslikud andmed: @ehisid', array('@ehisid' => $school->koolId));
        \Drupal::service('htm_custom_file_logging.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
      }
    }
    return $schools;
  }

  public function unpublish_school($ehisid){
    $schoolnode = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_ehis_id', $ehisid)
    ->condition('type', 'school')
    ->execute();

    $nid = array_shift($nid_result);
    $schoolnode['school_field']['nid'] = $nid;
    $schoolnode['school_field']['status'] = '0';
    return $schoolnode;
  }

  public function get_ehis_location_updateable_nodes(){
    $updateablenodes = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_update_location_from_ehis', '1')
    ->condition('type', 'school')
    ->execute();

    foreach($nid_result as $nodeid){
      $updateablenodes[$nodeid] = '';
    }

    return $updateablenodes;
  }

  public function get_unused_ehis_ids($existingids, $retrievedids){
    $unusedids = [];
    foreach($existingids as $id){
      if(!isset($retrievedids[$id])){
        $unusedids[] = $id;
      }
    }
    return $unusedids;
  }

  public function get_ehis_updateable_nodes(){
    $updateablenodes = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_update_from_ehis', '1')
    ->condition('type', 'school')
    ->execute();

    foreach($nid_result as $nodeid){
      $updateablenodes[$nodeid] = '';
    }

    return $updateablenodes;
  }


  public function get_existing_ehis_ids(){
    $schoolehisids = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('type', 'school')
    ->execute();

    foreach($nid_result as $nodeid){
      $schoolitem = \Drupal::entityTypeManager()->getStorage('node')->load( $nodeid);
      $schoolehisids[$nodeid] = $schoolitem->get('field_ehis_id')->getValue()[0]['value'];
    }

    return $schoolehisids;
  }

  public function check_school_existance($school, $upehis, $uplocehis){
    $schoolnode = [];

    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_ehis_id', $school->koolId)
    ->condition('type', 'school')
    ->execute();

    if(!empty($nid_result)) {

      // Match found, update existing node
      $nid = array_shift($nid_result);

      $schoolnode['school_field']['nid'] = $nid;
      $schoolnode['school_field']['field_ehis_id'] = $school->koolId;
      if(isset($upehis[$nid])){
        $schoolnode['school_field']['field_update_from_ehis'] = '1';
      }else{
        $schoolnode['school_field']['field_update_from_ehis'] = '0';
      }
      if(isset($uplocehis[$nid])){
        $schoolnode['school_field']['field_update_location_from_ehis'] = '1';
      }else{
        $schoolnode['school_field']['field_update_location_from_ehis'] = '0';
      }
    }else{
      $schoolnode['school_field']['field_ehis_id'] = $school->koolId;
      $schoolnode['school_field']['field_update_from_ehis'] = '1';
      $schoolnode['school_field']['field_update_location_from_ehis'] = '1';
    }
    return $schoolnode;
  }

  public function add_school_fields($school, $schoolnode, $ownershiptypes, $teachinglanguages, $schooltypes, $schoolnodes){
    if($schoolnode['school_field']['field_update_from_ehis'] == '1'){
      $schoolnode['school_field']['title'] = html_entity_decode(htmlspecialchars_decode($school->nimetus), ENT_QUOTES | ENT_HTML5);
      $schoolnode['school_field']['field_registration_code'] = $school->regNr;
      $institutetypevalues = [];
      //$node->field_educational_institution_type;
      $activityforms = [];
      $activitytype = $school->tegutsemiseOigused->tegutsemiseOigus[0]->tegevusloaLiigid->tegevusloaLiik;
      if(isset($activitytype)){
        foreach ($activitytype as $atype) {
          foreach($atype->tegutsemisvormid->tegutsemisvorm as $activity){
            $activityforms[$activity] = '';
          }
        }
      }
      foreach($schooltypes as $type){
        $key = array_keys($type);
        //kint($key[0]);
        if(isset($school->tyyp)){
          if($type[$key[0]] === $school->tyyp){
            $institutetypevalues[] = $key[0];
          }
        }
        if(isset($school->alamTyyp)){
          if($type[$key[0]] === $school->alamTyyp){
            $institutetypevalues[] = $key[0];
          }
        }
        if(isset($activityforms[$type[$key[0]]])){
          $institutetypevalues[] = $key[0];
        }
      }
      $schoolnode['school_field']['field_educational_institution_ty'] = array_unique($institutetypevalues);
      $ownershipvalues = [];
      if(isset($ownershiptypes[$school->omandivorm])){
        $ownershipvalues[] = $ownershiptypes[$school->omandivorm];
      }
      $schoolnode['school_field']['field_ownership_type'] = $ownershipvalues;
      if(isset($school->juriidilineAadress)){
        if(isset($school->juriidilineAadress->adrId)){
          $schoolnode['school_field']['field_adrid'] = $school->juriidilineAadress->adrId;
        }
      }
      $langvalues = [];
      if(isset($school->oppeKeeled)){
        foreach($school->oppeKeeled->oppeKeel as $ehislanguage){
          if(isset($teachinglanguages[$this->parse_key($ehislanguage)])){
            $langvalues[] = $teachinglanguages[$this->parse_key($ehislanguage)];
          }
        }
      }
      $schoolnode['school_field']['field_teaching_language'] = $langvalues;
      if(isset($school->kontaktAndmed)){
        if(isset($school->kontaktAndmed->telefon)){
          $schoolnode['school_field']['field_school_contact_phone'] = $school->kontaktAndmed->telefon;
        }
        if(isset($school->kontaktAndmed->epost)){
          $schoolnode['school_field']['field_school_contact_email'] = $school->kontaktAndmed->epost;
        }
        if(isset($school->kontaktAndmed->veebiLeht)){
          $schoolnode['school_field']['field_school_webpage_address'] = $school->kontaktAndmed->veebiLeht;
        }
      }
      $schoolnode['school_field']['field_ehis_id'] = $school->koolId;
      $schoolnode['school_field']['field_created_from_ehis_datetime'] = \Drupal::time()->getRequestTime();
      $schoolnode['school_field']['field_update_from_ehis'] = '1';
      $schoolnode['school_field']['status'] = '1';
    }
    if($schoolnode['school_field']['field_update_location_from_ehis'] == '1'){
      if(isset($schoolnode['school_field']['field_adrid'])){

        $adrid = $schoolnode['school_field']['field_adrid'];
        $json_url = 'https://inaadress.maaamet.ee/inaadress/gazetteer?adrid='.$adrid;

        $client = \Drupal::httpClient();

        $response = $client->request('GET', $json_url);
        $data = $response->getBody();
        $data_from_json = json_decode($data->getContents());
        if(isset($data_from_json->error)){
          kint($data_from_json->error);
        }else if(isset($data_from_json->addresses)){
          foreach($data_from_json->addresses as $address){
            if(isset($address->unik) && isset($address->liikVal)){
              if($address->unik === '1' && $address->liikVal === 'EHITIS'){
                if(isset($address->maakond) && isset($address->omavalitsus) && isset($address->asustusyksus) && isset($address->ehakmk) && isset($address->ehakov) && isset($address->ehak)){
                  if($address->maakond != '' && $address->omavalitsus != '' && $address->ehakmk != '' && $address->ehakov != ''){
                    $schoolnode['school_location_taxonomy']['field_school_county']['code'] = $address->ehakmk;
                    $schoolnode['school_location_taxonomy']['field_school_county']['name'] = $address->maakond;
                    $schoolnode['school_location_taxonomy']['field_school_local_gov']['code'] = $address->ehakov;
                    $schoolnode['school_location_taxonomy']['field_school_local_gov']['name'] = $address->omavalitsus;
                    $schoolnode['school_location_taxonomy']['field_school_set_unit']['code'] = $address->ehak;
                    $schoolnode['school_location_taxonomy']['field_school_set_unit']['name'] = $address->asustusyksus;
                  }
                }
                $schoolnode['school_location_paragraph']['field_address'] = $address->ipikkaadress;
                $schoolnode['school_location_paragraph']['field_search_address'] = substr($address->ipikkaadress, strpos($address->ipikkaadress, ',') + 2);
                $schoolnode['school_location_paragraph']['field_coordinates']['name'] = $address->ipikkaadress;
                $schoolnode['school_location_paragraph']['field_coordinates']['lat'] = $address->viitepunkt_b;
                $schoolnode['school_location_paragraph']['field_coordinates']['lon'] = $address->viitepunkt_l;
                $schoolnode['school_location_paragraph']['field_location_type'] = 'L';
                break;
              }
            }
          }
          if(!isset($schoolnode['school_location_paragraph'])){
            foreach($data_from_json->addresses as $address){
              if(isset($address->maakond) && isset($address->omavalitsus) && isset($address->asustusyksus) && isset($address->ehakmk) && isset($address->ehakov) && isset($address->ehak)){
                if($address->maakond != '' && $address->omavalitsus != '' && $address->ehakmk != '' && $address->ehakov != ''){
                  $schoolnode['school_location_taxonomy']['field_school_county']['code'] = $address->ehakmk;
                  $schoolnode['school_location_taxonomy']['field_school_county']['name'] = $address->maakond;
                  $schoolnode['school_location_taxonomy']['field_school_local_gov']['code'] = $address->ehakov;
                  $schoolnode['school_location_taxonomy']['field_school_local_gov']['name'] = $address->omavalitsus;
                  $schoolnode['school_location_taxonomy']['field_school_set_unit']['code'] = $address->ehak;
                  $schoolnode['school_location_taxonomy']['field_school_set_unit']['name'] = $address->asustusyksus;
                }
              }
              $schoolnode['school_location_paragraph']['field_address'] = $address->ipikkaadress;
              $schoolnode['school_location_paragraph']['field_search_address'] = substr($address->ipikkaadress, strpos($address->ipikkaadress, ',') + 2);
              $schoolnode['school_location_paragraph']['field_coordinates']['name'] = $address->ipikkaadress;
              $schoolnode['school_location_paragraph']['field_coordinates']['lat'] = $address->viitepunkt_b;
              $schoolnode['school_location_paragraph']['field_coordinates']['lon'] = $address->viitepunkt_l;
              $schoolnode['school_location_paragraph']['field_location_type'] = 'L';
              break;
            }
          }
        }
      }
      if (isset($schoolnode['school_field']['field_ehis_id'])){
        $ehis_id = $schoolnode['school_field']['field_ehis_id'];
        if (isset($schoolnodes[$ehis_id])) {
          $schoolOpenEhis = $schoolnodes[$ehis_id];
          if (!empty($schoolOpenEhis['hooned']) && !empty($schoolOpenEhis['hooned']['hoone'])){
            $buildings = $schoolOpenEhis['hooned']['hoone'];
            $i = 0;
            foreach ($buildings as $building) {
              if (!is_array($building)){
                continue;
              }
              if ($building['peahoone'] == 'jah') {
                if (!isset($building['adsAdrId'])){
                  continue;
                }
                $json_url = 'https://inaadress.maaamet.ee/inaadress/gazetteer?adrid='.$building['adsAdrId'];

                $client = \Drupal::httpClient();

                $response = $client->request('GET', $json_url);
                $data = $response->getBody();
                $maaamet_address = json_decode($data->getContents());
                if(isset($maaamet_address->error)){
                  kint($maaamet_address->error);
                }else if(isset($maaamet_address->addresses)) {
                  foreach ($maaamet_address->addresses as $address_maaamet) {
                    $schoolnode['ehis_schools'][$i]['field_address'] = $address_maaamet->ipikkaadress;
                    $schoolnode['ehis_schools'][$i]['field_search_address'] = substr($address_maaamet->ipikkaadress, strpos($address_maaamet->ipikkaadress, ',') + 2);
                    $schoolnode['ehis_schools'][$i]['field_coordinates']['name'] = $address_maaamet->ipikkaadress;
                    $schoolnode['ehis_schools'][$i]['field_coordinates']['lat'] = $address_maaamet->viitepunkt_b;
                    $schoolnode['ehis_schools'][$i]['field_coordinates']['lon'] = $address_maaamet->viitepunkt_l;
                    $schoolnode['ehis_schools'][$i]['field_location_type'] = 'L';
                  }
                }
              }
              $i++;
            }
          }
        }

      }
    }
    return $schoolnode;
  }
  public function save_school($school, $loctaxonomy){
    if(isset($school['school_field']['nid'])){
      if($school['school_field']['status'] == '1'){
        $action = 'update';
      }else{
        $action = 'unpublish';
      }
      $node_storage = \Drupal::entityTypeManager()->getStorage('node');
      $node = $node_storage->load($school['school_field']['nid']);
    }else if(!isset($school['school_field']['nid'])){
      $action = 'create';
      $node = Node::create([
        'type' => 'school',
        'langcode' => 'et',
        'created' => \Drupal::time()->getRequestTime(),
        'changed' => \Drupal::time()->getRequestTime(),
        'uid' => 1,
        'title' => sprintf('%s', $school['school_field']['title']),
      ]);
    }
    if(isset($school['school_location_paragraph'])){
      if(isset($node->toArray()['field_school_location'][0]['target_id'])){
        $paragraph = \Drupal::entityTypeManager()->getStorage('paragraph')->load($node->toArray()['field_school_location'][0]['target_id']);
      }else{
        $paragraph = Paragraph::create(['type' => 'school_location',]);
      }
      foreach($school['school_location_paragraph'] as $fieldlabel => $fieldvalue){
        $paragraph->set($this->parse_key($fieldlabel), $fieldvalue);
      }
      if(isset($school['school_location_taxonomy'])){
        $county = $school['school_location_taxonomy']['field_school_county'];
        $localgov = $school['school_location_taxonomy']['field_school_local_gov'];
        $setunit = $school['school_location_taxonomy']['field_school_set_unit'];
        $terms = [];

        if(!isset($loctaxonomy[$this->parse_key($county['name'])])){
          $countyterm = Term::create([
            'name' => $county['name'],
            'vid' => 'educational_institution_location',
            'field_ehak' => $county['code'],
          ]);
        }else{
          $termid = \Drupal::entityQuery('taxonomy_term')
          ->condition('vid', 'educational_institution_location')
          ->condition('name', $county['name'])
          ->execute();
          $key = key($termid);
          $countyterm = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($termid[$key]);
        }
        $countyterm->save();
        $terms[] = $countyterm->get('tid')->getValue()[0]['value'];

        if(!isset($loctaxonomy[$this->parse_key($localgov['name'])])){
          $localgovterm = Term::create([
            'name' => $localgov['name'],
            'vid' => 'educational_institution_location',
            'field_ehak' => $localgov['code'],
            'parent' => $countyterm->get('tid')->getValue()[0]['value'],
          ]);
        }else{
          $termid = \Drupal::entityQuery('taxonomy_term')
          ->condition('vid', 'educational_institution_location')
          ->condition('name', $localgov['name'])
          ->execute();
          $key = key($termid);
          $localgovterm = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($termid[$key]);
        }
        $localgovterm->save();
        $terms[] = $localgovterm->get('tid')->getValue()[0]['value'];

        if($setunit['name'] != ''){
          if(!isset($loctaxonomy[$this->parse_key($setunit['name'])])){
            $setunitterm = Term::create([
              'name' => $setunit['name'],
              'vid' => 'educational_institution_location',
              'field_ehak' => $setunit['code'],
              'parent' => $localgovterm->get('tid')->getValue()[0]['value'],
            ]);
          }else{
            $termid = \Drupal::entityQuery('taxonomy_term')
            ->condition('vid', 'educational_institution_location')
            ->condition('name', $setunit['name'])
            ->execute();
            $key = key($termid);
            $setunitterm = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($termid[$key]);
          }
          $setunitterm->save();
          $terms[] = $setunitterm->get('tid')->getValue()[0]['value'];
        }
        $paragraph->set('field_school_location', array('target_id' => end($terms)));
      }
      if($paragraph->id() != NULL){
        $paragraph->isNew();
      }
      $paragraph->save();
      $locparagraph[] = array(
        'target_id' => $paragraph->id(),
        'target_revision_id' => $paragraph->getRevisionId(),
      );
      $node->set('field_school_location', $locparagraph);
    }
    foreach($school['school_field'] as $fieldlabel => $fieldvalue){
      $node->set($this->parse_key($fieldlabel), $fieldvalue);
    }
    if (!empty($school['ehis_schools'])) {
      if (empty($node->toArray()['field_school_location'])){
        $this->add_address($node, $school['ehis_schools']);
      }
      else{
        $locations_saved = $node->toArray()['field_school_location'];
        foreach ($school['ehis_schools'] as $ehis_school) {

          $ehis_location_address = $ehis_school['field_address'];
          $location_changed = false;
          $location_exists = false;
          foreach ($locations_saved as $location) {
            $loaded =  \Drupal::entityTypeManager()->getStorage('paragraph')->load($location['target_id']);
            \Drupal::logger('ehis_school')->debug(print_r($loaded->toArray(),TRUE));
            $loaded_address = $loaded->get('field_address')->value;
            \Drupal::logger('ehis_school')->debug(print_r($loaded_address,TRUE));
            if ($ehis_location_address == $loaded_address){
              $location_exists = TRUE;
              if ($loaded->get('field_address')->value != $ehis_school['field_address']) {
                $loaded->set('field_address', $ehis_school['field_address']);
                $location_changed = TRUE;
              }
              if ($loaded->get('field_search_address')!=$ehis_school['field_search_address']){
                $loaded->set('field_search_address', $ehis_school['field_search_address']);
                $location_changed = TRUE;
              }

              $changed_coords = FALSE;
           
              $coordinates = $loaded->get('field_coordinates')->getValue();

              if (!empty($coordinates)){
                $coordinates = reset($coordinates);
                if ($coordinates['lat']!=$ehis_school['field_coordinates']['lat']){
                  $lat = $ehis_school['field_coordinates']['lat'];
                  $changed_coords = TRUE;
                }
                else{
                  $lat = $coordinates['lat'];
                }
                if ($coordinates['lon']!=$ehis_school['field_coordinates']['lon']){
                  $lon = $ehis_school['field_coordinates']['lon'];
                  $changed_coords = TRUE;
                }
                else{
                  $lon = $coordinates['lon'];
                }
                if ($coordinates['name']!=$ehis_school['field_coordinates']['name']){
                  $name = $ehis_school['field_coordinates']['name'];
                  $changed_coords = TRUE;
                }
                else{
                  $name = $coordinates['name'];
                }
              }
              if ($changed_coords) {
                $coords = [
                  'name' => $name ,
                  'lat' => $lat,
                  'lon' => $lon
                ];
                $loaded->set('field_coordinates', $coords);
                $location_changed = TRUE;
              }
            }
            if ($location_changed) {
              $loaded ->save();
            }

          }
          if (!$location_exists) {
            $para_loc = Paragraph::create([
              'type' => 'school_location',
              'field_address' => $ehis_school['field_address'],
              'field_search_address' => $ehis_school['field_search_address'],
              'field_coordinates' => $ehis_school['field_coordinates'],
            ]);
            $para_loc->save();
            $node->field_school_location->appendItem($para_loc);
          }
        }
      }
    }
    $node->save();
    return $action;
  }

  public function get_taxonomy_terms($taxonomy){
    $query = \Drupal::entityQuery('taxonomy_term');
    $query->condition('vid', $taxonomy);
    $tids = $query->execute();
    $terms = \Drupal\taxonomy\Entity\Term::loadMultiple($tids);
    $terms_parsed = [];
    foreach($terms as $term){
      $terms_parsed[$this->parse_key($term->getName())] = ['target_id' => $term->id()];
    }

    return $terms_parsed;
  }
  public function get_taxonomy_ehis_outputs($taxonomy){
    $query = \Drupal::entityQuery('taxonomy_term');
    $query->condition('vid', $taxonomy);
    $tids = $query->execute();
    $terms = \Drupal\taxonomy\Entity\Term::loadMultiple($tids);
    $terms_parsed = [];
    foreach($terms as $term){
      $ehisoutputs = $term->get('field_ehis_output')->getValue();
      foreach($ehisoutputs as $output){
        $terms_parsed[] = [$term->id() => $output['value']];
      }
    }
    return $terms_parsed;
  }

  private function parse_key($key){
    return mb_strtolower(str_replace(' ', '_', $key));
  }
  public function getSchoolOpenNodes() {
    $ehis_xml_url = 'http://enda.ehis.ee/avaandmed/rest/hooned';
    $client = \Drupal::httpClient();
    try{
      $response = $client->request('GET', $ehis_xml_url);
    }
    catch(RequestException $e){
      $message = t('EHIS avaandmete päringu viga: @error', array('@error' => $e));
      \Drupal::service('htm_custom_file_logging.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }
    if (!empty($response)) {
      $xml = $response->getBody()->getContents();
      $xml = simplexml_load_string($xml);
      $json = json_encode($xml);
      $array = json_decode($json,TRUE);
      if (!empty($array['body']) && !empty($array['body']['kool'])){
        $schools = $array['body']['kool'];
      }
      if (empty($schools)){
        \Drupal::logger('school_import')->error('Schools missing from ehis response');
      }
      $schools_out = [];
      foreach ($schools as $school) {
        if (empty($school['oppeasutusId'])){
          if (!empty($school['oppeasutusNimetus'])){
            \Drupal::logger('school_import')->error('Oppeasutusel @schoolname puudub id',['@schoolname'=>$school['oppeasutusNimetus']]);
            continue;
          }
        }
        $schools_out[$school['oppeasutusId']] = $school;
      }
      return $schools_out;
    }
  }
}
