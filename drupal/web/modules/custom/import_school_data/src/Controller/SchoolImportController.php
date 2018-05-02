<?php

namespace Drupal\import_school_data\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;

/**
* Class SchoolImportController.
*/
class SchoolImportController extends ControllerBase {

  public function import() {
    $schools = $this->getSchoolData('school');
    $ownershiptypes = $this->getTaxonomyTerms('ownership_type');
    $teachinglanguages = $this->getTaxonomyTerms('teaching_language');
    $schooltypes = $this->getTaxonomyEhisOutputs('educational_institution_type');
    $schoolnodes = [];
    foreach($schools as $school){
      $schoolnode['node_response'] = $this->check_school_existance($school);
      if($schoolnode['node_response']['field_update_from_ehis'] === '1'){
        $schoolnode['edited_node'] = $this->add_school_fields($school, $schoolnode['node_response'], $ownershiptypes, $teachinglanguages, $schooltypes);
        $schoolnodes[] = $schoolnode['edited_node'];
      }
    }
    return $schoolnodes;
  }

  public function getSchoolData($type){
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
      // Load node
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

  public function getTaxonomyTerms($taxonomy){
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
  public function getTaxonomyEhisOutputs($taxonomy){
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
