<?php

namespace Drupal\import_school_data\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;

/**
* Class SchoolImportController.
*/
class SchoolImportController extends ControllerBase {

  public function import() {
    $schoolnodes = [];
    $retrieved_ehis_ids = [];
    $schools = $this->get_school_data('school');
    $ownershiptypes = $this->get_taxonomy_terms('ownership_type');
    $teachinglanguages = $this->get_taxonomy_terms('teaching_language');
    $schooltypes = $this->get_taxonomy_ehis_outputs('educational_institution_type');
    $existing_ehis_ids = $this->get_existing_ehis_ids();
    foreach($schools as $school){
      $schoolnode['node_response'] = $this->check_school_existance($school);
      if($schoolnode['node_response']['field_update_from_ehis'] === '1'){
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

    $response = $client->request('GET', $json_url);
    $data = $response->getBody();
    $data_from_json = json_decode($data->getContents());
    $schools = $data_from_json->body->oppeasutused->oppeasutus;
    return $schools;
  }

  public function unpublish_school($ehisid){
    $schoolnode = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_ehis_id', $ehisid)
    ->execute();

    $nid = array_shift($nid_result);
    $schoolnode['nid'] = $nid;
    $schoolnode['status'] = '0';
    return $schoolnode;
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

  public function check_school_existance($school){
    $schoolnode = [];
    $query = \Drupal::entityQuery('node');
    $group = $query
    ->andConditionGroup()
    ->condition('field_ehis_id', $school->koolId)
    ->condition('field_update_from_ehis', '1');
    $query->condition($group);
    $nid_result = $query->execute();

    if(!empty($nid_result)) {

      // Match found, update existing node
      $nid = array_shift($nid_result);

      $schoolnode['nid'] = $nid;
      $schoolnode['field_ehis_id'] = $school->koolId;
      $schoolnode['field_update_from_ehis'] = '1';
    }else{
      $query = \Drupal::entityQuery('node');
      $group = $query
      ->andConditionGroup()
      ->condition('field_ehis_id', $school->koolId)
      ->condition('field_update_from_ehis', '0');
      $query->condition($group);
      $nid_result = $query->execute();

      if(!empty($nid_result)){
        $nid = array_shift($nid_result);
        $schoolnode['nid'] = $nid;
        $schoolnode['field_ehis_id'] = $school->koolId;
        $schoolnode['field_update_from_ehis'] = '0';
      }else{
        $schoolnode['field_ehis_id'] = $school->koolId;
        $schoolnode['field_update_from_ehis'] = '1';
      }
    }
    return $schoolnode;
  }

  public function add_school_fields($school, $schoolnode, $ownershiptypes, $teachinglanguages, $schooltypes){
    if($schoolnode['field_update_from_ehis'] == '1'){
      $schoolnode['title'] = $school->nimetus;
      $schoolnode['field_registration_code'] = $school->regNr;
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
      $schoolnode['field_educational_institution_ty'] = array_unique($institutetypevalues);
      $ownershipvalues = [];
      if(isset($ownershiptypes[$school->omandivorm])){
        $ownershipvalues[] = $ownershiptypes[$school->omandivorm];
      }
      $schoolnode['field_ownership_type'] = $ownershipvalues;
      if(isset($school->juriidilineAadress)){
        $schoolnode['field_adrid'] = $school->juriidilineAadress->adrId;
      }
      $langvalues = [];
      if(isset($school->oppeKeeled)){
        foreach($school->oppeKeeled->oppeKeel as $ehislanguage){
          if(isset($teachinglanguages[$this->parse_key($ehislanguage)])){
            $langvalues[] = $teachinglanguages[$this->parse_key($ehislanguage)];
          }
        }
      }
      $schoolnode['field_teaching_language'] = $langvalues;
      if(isset($school->kontaktAndmed)){
        if(isset($school->kontaktAndmed->telefon)){
          $schoolnode['field_school_contact_phone'] = $school->kontaktAndmed->telefon;
        }else{
          $schoolnode['field_school_contact_phone'] = '';
        }
        if(isset($school->kontaktAndmed->epost)){
          $schoolnode['field_school_contact_email'] = $school->kontaktAndmed->epost;
        }else{
          $schoolnode['field_school_contact_email'] = '';
        }
        if(isset($school->kontaktAndmed->veebiLeht)){
          $schoolnode['field_school_webpage_address'] = $school->kontaktAndmed->veebiLeht;
        }else{
          $schoolnode['field_school_webpage_address'] = '';
        }
      }
      $schoolnode['field_ehis_id'] = $school->koolId;
      $schoolnode['field_created_from_ehis_datetime'] = REQUEST_TIME;
      $schoolnode['field_update_from_ehis'] = '1';
      $schoolnode['status'] = '1';
    }
    return $schoolnode;
  }
  public function save_school($school){
    if(isset($school['nid'])){
      $node_storage = \Drupal::entityManager()->getStorage('node');
      $node = $node_storage->load($school['nid']);
    }else if(!isset($school['nid'])){
      $node = Node::create([
        'type' => 'school',
        'langcode' => 'et',
        'created' => REQUEST_TIME,
        'changed' => REQUEST_TIME,
        'uid' => 1,
        'title' => sprintf('%s', $school['title']),
      ]);
    }
    foreach($school as $fieldlabel => $fieldvalue){
      $node->set($this->parse_key($fieldlabel), $fieldvalue);
    }
    $node->save();
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
