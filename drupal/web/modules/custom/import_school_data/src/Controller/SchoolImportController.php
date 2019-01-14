<?php

namespace Drupal\import_school_data\Controller;

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
    $update_from_ehis_nodes = $this->get_ehis_updateable_nodes();
    $update_location_from_ehis_nodes = $this->get_ehis_location_updateable_nodes();
    $ownershiptypes = $this->get_taxonomy_terms('ownership_type');
    $teachinglanguages = $this->get_taxonomy_terms('teaching_language');
    $schooltypes = $this->get_taxonomy_ehis_outputs('educational_institution_type');
    $existing_ehis_ids = $this->get_existing_ehis_ids();
    foreach($schools as $school){
      $schoolnode['node_response'] = $this->check_school_existance($school, $update_from_ehis_nodes, $update_location_from_ehis_nodes);
      if($schoolnode['node_response']['school_field']['field_update_from_ehis'] === '1'){
        $schoolnode['edited_node'] = $this->add_school_fields($school, $schoolnode['node_response'], $ownershiptypes, $teachinglanguages, $schooltypes);
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
      $json_url = 'http://enda.ehis.ee/avaandmed/rest/oppeasutused/-/-/-/-/-/-/-/-/-/-/1/JSON';
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
      \Drupal::service('custom_logging_to_file.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }

    $data = $response->getBody();
    $data_from_json = json_decode($data->getContents());
    $schools = $data_from_json->body->oppeasutused->oppeasutus;
    foreach($schools as $key => $school){
      if(!isset($school->regNr) || !isset($school->nimetus)){
        unset($schools[$key]);
        $message = t('Puuduvad kohustuslikud andmed: @ehisid', array('@ehisid' => $school->koolId));
        \Drupal::service('custom_logging_to_file.write')->write('error', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
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
      $schoolitem = entity_load('node', $nodeid);
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

  public function add_school_fields($school, $schoolnode, $ownershiptypes, $teachinglanguages, $schooltypes){
    if($schoolnode['school_field']['field_update_from_ehis'] == '1'){
      $schoolnode['school_field']['title'] = html_entity_decode(htmlspecialchars_decode($school->nimetus), ENT_QUOTES | ENT_HTML5);
      $schoolnode['school_field']['field_registration_code'] = $school->regNr;
      $institutetypevalues = [];
      //$node->field_educational_institution_type;
      $activityforms = [];
      if(isset($school->tegutsemisvormid->tegutsemisvorm)){
        foreach($school->tegutsemisvormid->tegutsemisvorm as $activity){
          $activityforms[$activity] = '';
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
      $schoolnode['school_field']['field_created_from_ehis_datetime'] = REQUEST_TIME;
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
              $schoolnode['school_location_paragraph']['field_coordinates']['name'] = $address->ipikkaadress;
              $schoolnode['school_location_paragraph']['field_coordinates']['lat'] = $address->viitepunkt_b;
              $schoolnode['school_location_paragraph']['field_coordinates']['lon'] = $address->viitepunkt_l;
              $schoolnode['school_location_paragraph']['field_location_type'] = 'L';
              break;
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
      $node_storage = \Drupal::entityManager()->getStorage('node');
      $node = $node_storage->load($school['school_field']['nid']);
    }else if(!isset($school['school_field']['nid'])){
      $action = 'create';
      $node = Node::create([
        'type' => 'school',
        'langcode' => 'et',
        'created' => REQUEST_TIME,
        'changed' => REQUEST_TIME,
        'uid' => 1,
        'title' => sprintf('%s', $school['school_field']['title']),
      ]);
    }
    if(isset($school['school_location_paragraph'])){
      if(isset($node->toArray()['field_school_location'][0]['target_id'])){
        $paragraph = entity_load('paragraph', $node->toArray()['field_school_location'][0]['target_id']);
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
          $countyterm = entity_load('taxonomy_term', $termid[$key]);
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
          $localgovterm = entity_load('taxonomy_term', $termid[$key]);
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
            $setunitterm = entity_load('taxonomy_term', $termid[$key]);
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
}
