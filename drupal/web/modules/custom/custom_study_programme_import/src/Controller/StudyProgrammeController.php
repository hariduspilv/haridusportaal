<?php

namespace Drupal\custom_study_programme_import\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\Entity\Term;

/**
 * Class StudyProgrammeController.
 */
class StudyProgrammeController extends ControllerBase {

  public function import() {
    $programmes = $this->get_programme_data('programme');
    $update_from_ehis_nodes = $this->get_ehis_updateable_nodes();
    $existing_ehis_ids = $this->get_existing_ehis_ids();
    $schools = $this->get_existing_schools();
    $programmetypes = $this->get_taxonomy_terms('studyprogrammetype');
    $programmelevels = $this->get_taxonomy_ehis_outputs('studyprogrammelevel');
    foreach($programmes as $programme){
      $programmenode['node_response'] = $this->check_programme_existance($programme, $update_from_ehis_nodes);
      if($programmenode['node_response']['programme_field']['field_update_from_ehis'] === '1'){
        $programmenode['edited_node'] = $this->add_programme_fields($programme, $programmenode['node_response'], $schools, $programmetypes, $programmelevels);
        $programmenodes[] = $programmenode['edited_node'];
      }
    }
    return $programmenodes;
  }

  public function get_programme_data($type){
    switch($type){
      case 'programme':
      $json_urls[] = 'http://enda.ehis.ee/avaandmed/rest/oppekavad/-/-/OK_LIIK_KORG/1/JSON';
      $json_urls[] = 'http://enda.ehis.ee/avaandmed/rest/oppekavad/-/-/OK_LIIK_KUTSE/1/JSON';
      break;
      default:
      return [];
    }

    $client = \Drupal::httpClient();

    foreach($json_urls as $url){
      $response = $client->request('GET', $url);
      $data = $response->getBody();
      $data_from_json = json_decode($data->getContents());
      foreach($data_from_json->body->oppekavad->oppekava as $oppekava){
        if($oppekava->vastuvott != 'Vastuvõttu ei toimu, õppimine keelatud'){
          $programmes[] = $oppekava;
        }
      }
    }
    return $programmes;
  }

  public function get_ehis_updateable_nodes(){
    $updateablenodes = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_update_from_ehis', '1')
    ->condition('type', 'study_programme')
    ->execute();

    foreach($nid_result as $nodeid){
      $updateablenodes[$nodeid] = '';
    }

    return $updateablenodes;
  }

  public function get_existing_ehis_ids(){
    $programmeehisids = [];
    $nid_result = \Drupal::entityQuery('node')
    ->condition('type', 'study_programme')
    ->execute();

    foreach($nid_result as $nodeid){
      $programmeitem = entity_load('node', $nodeid);
      $programmeehisids[$nodeid] = $programmeitem->get('field_ehis_id')->getValue()[0]['value'];
    }

    return $programmeehisids;
  }

  public function get_existing_schools(){
    $nid_result = \Drupal::entityQuery('node')
    ->condition('type', 'school')
    ->execute();

    foreach($nid_result as $nodeid){
      $programmeitem = entity_load('node', $nodeid);
      $programmeehisids[$programmeitem->get('field_ehis_id')->getValue()[0]['value']] = $nodeid;
    }
    return $programmeehisids;
  }

  public function check_programme_existance($programme, $upehis){
    $programmenode = [];

    $nid_result = \Drupal::entityQuery('node')
    ->condition('field_ehis_id', $programme->oppekavaKood)
    ->condition('type', 'study_programme')
    ->execute();

    if(!empty($nid_result)) {

      // Match found, update existing node
      $nid = array_shift($nid_result);

      $programmenode['programme_field']['nid'] = $nid;
      $programmenode['programme_field']['field_ehis_id'] = $programme->oppekavaKood;
      if(isset($upehis[$nid])){
        $programmenode['programme_field']['field_update_from_ehis'] = '1';
      }else{
        $programmenode['programme_field']['field_update_from_ehis'] = '0';
      }
    }else{
      $programmenode['programme_field']['field_ehis_id'] = $programme->oppekavaKood;
      $programmenode['programme_field']['field_update_from_ehis'] = '1';
    }
    return $programmenode;
  }

  public function add_programme_fields($programme, $programmenode, $schools, $programmetypes, $programmelevels){
    if($programmenode['programme_field']['field_update_from_ehis'] == '1'){
      $programmenode['programme_field']['title'] = html_entity_decode(htmlspecialchars_decode($programme->oppekavaNimetus), ENT_QUOTES | ENT_HTML5);
      $programmenode['programme_field']['field_ehis_id'] = $programme->oppekavaKood;
      if(isset($schools[$programme->koolId])){
        $programmenode['programme_field']['field_educational_institution'] = $schools[$programme->koolId];
      }

      $programmetypevalues = [];
      if(isset($programmetypes[$this->parse_key($programme->oppekavaLiik)])){
        $programmetypevalues[] = $programmetypes[$this->parse_key($programme->oppekavaLiik)];
      }
      $programmenode['programme_field']['field_study_programme_type'] = $programmetypevalues;

      $programmelevelvalue = '';
      foreach($programmelevels as $level){
        $key = array_keys($level);
        //kint($key[0]);
        if(isset($programme->ope)){
          if($level[$key[0]] === $programme->ope){
            $programmelevelvalue = $key[0];
          }
        }
      }
      $programmenode['programme_field']['field_study_programme_level'] = $programmelevelvalue;
      $programmenode['programme_field']['field_created_from_ehis_datetime'] = REQUEST_TIME;
      $programmenode['programme_field']['field_update_from_ehis'] = '1';
      $programmenode['programme_field']['status'] = '1';
    }
    return $programmenode;
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
