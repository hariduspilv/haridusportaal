<?php

namespace Drupal\htm_custom_study_programme_import\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;

/**
 * Class StudyProgrammeController.
 */
class StudyProgrammeController extends ControllerBase {

    public function import() {

        $this->programmenodes = [];
        $schools = $this->get_existing_schools();
        $taxonomies['studyprogrammetype'] = $this->get_taxonomy_terms('studyprogrammetype');
        $programmes = $this->get_programme_data('programme', $schools, $taxonomies['studyprogrammetype']);
        $update_from_ehis_nodes = $this->get_ehis_updateable_nodes();
        $taxonomies['iscedf'] = $this->get_taxonomy_outputs('isced_f','field_code');
        $taxonomies['degreeordiploma'] = $this->get_taxonomy_terms('degreeordiploma');
        $taxonomies['teaching_language'] = $this->get_taxonomy_terms('teaching_language');
        $taxonomies['qual_id'] = $this->get_taxonomy_terms('qualificationstandardid');
        $taxonomies['studyprogrammelevel'] = $this->get_taxonomy_outputs('studyprogrammelevel','field_ehis_output');
        foreach($programmes as $programme){
            $programmenode['node_response'] = $this->check_programme_existance($programme, $update_from_ehis_nodes);
            if($programmenode['node_response']['programme_field']['field_update_from_ehis'] === '1'){
                $programmenode['edited_node'] = $this->add_programme_fields($programme, $programmenode['node_response'], $schools, $taxonomies);
                if(isset($programmenode['edited_node']['programme_field']['field_educational_institution'])){
                    $this->programmenodes[] = $programmenode['edited_node'];
                }
            }
        }
        $unpublishnodes = $this->unpublishNonExistantProgrammes($programmes);
        $this->programmenodes = array_merge($this->programmenodes, $unpublishnodes);
        return $this->programmenodes;
    }

    public function get_programme_data($type, $schools, $programmetype){
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
            try{
                $response = $client->request('GET', $url);
            }
            catch(RequestException $e){
                $message = t('EHIS avaandmete päringu viga: @error', array('@error' => $e));
                \Drupal::service('htm_custom_file_logging.write')->write('error', 'EHIS avaandmetest õppekava uuendamine', $message);
            }

            $data = $response->getBody()->getContents();
            $data_from_json = json_decode(str_replace(array("\n", "\r"), '', $data));
            foreach($data_from_json->body->oppekavad->oppekava as $oppekava){
                if($oppekava->vastuvott != 'Vastuvõttu ei toimu, õppimine keelatud' && isset($programmetype[$this->parse_key($oppekava->oppekavaLiik)])){
                    if(isset($schools[$oppekava->koolId]) && isset($oppekava->oppekavaNimetus) && !empty($oppekava->oppekavaNimetus) && isset($oppekava->oppekavaKood) && !empty($oppekava->oppekavaKood) && isset($oppekava->oppekavaLiik) && !empty($oppekava->oppekavaLiik)){
                        $programmes[] = $oppekava;
                    }else{
                        $message = t('Puuduvad kohustuslikud andmed õppekavas: @code', array('@code' => $oppekava->oppekavaKood));
                        \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppekava uuendamine', $message);
                    }
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

    public function get_existing_schools(){
        $nid_result = \Drupal::entityQuery('node')
            ->condition('type', 'school')
            ->execute();
        foreach($nid_result as $nodeid){
            $programmeitem = entity_load('node', $nodeid);
            $ehisid = $programmeitem->get('field_ehis_id')->getValue()[0]['value'];
            $programmeehisids[$ehisid] = $nodeid;
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

            if(!empty($nid_result)){
                foreach($nid_result as $node_id){
                    $programme_object = [
                        'programme_field' => [
                            'nid' => $node_id
                        ],
                        'action' => 'delete'
                    ];
                    $this->programmenodes[] = $programme_object;
                }
            }

            $programmenode['action'] = 'update';
            $programmenode['programme_field']['nid'] = $nid;
            $programmenode['programme_field']['field_ehis_id'] = $programme->oppekavaKood;
            if(isset($upehis[$nid])){
                $programmenode['programme_field']['field_update_from_ehis'] = '1';
            }else{
                $programmenode['programme_field']['field_update_from_ehis'] = '0';
            }
        }else{
            $programmenode['action'] = 'create';
            $programmenode['programme_field']['field_ehis_id'] = $programme->oppekavaKood;
            $programmenode['programme_field']['field_update_from_ehis'] = '1';
        }
        return $programmenode;
    }

    public function add_programme_fields($programme, $programmenode, $schools, $taxonomies){
        if($programmenode['programme_field']['field_update_from_ehis'] == '1'){
            if(isset($programme->oppekavaNimetus)){
                $programmenode['programme_field']['title'] = trim(html_entity_decode(htmlspecialchars_decode($programme->oppekavaNimetus), ENT_QUOTES | ENT_HTML5));
            }
            if(isset($programme->oppekavaKood)){
                $programmenode['programme_field']['field_ehis_id'] = $programme->oppekavaKood;
            }
            if(isset($schools[$programme->koolId])){
                $programmenode['programme_field']['field_educational_institution'] = $schools[$programme->koolId];
            }else{
                $message = t('Puudub õppekavas @programme viidatud õppeasutus @schoolcode.', array('@programme' => $programme->oppekavaKood, '@schoolcode' => $programme->koolId));
                \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppekava uuendamine', $message);
            }

            if(isset($taxonomies['studyprogrammetype'][$this->parse_key($programme->oppekavaLiik)])){
                $programmetypevalue = $taxonomies['studyprogrammetype'][$this->parse_key($programme->oppekavaLiik)];
                $programmenode['programme_field']['field_study_programme_type'] = $programmetypevalue;
                if($this->parse_key($programme->oppekavaLiik) == 'kõrghariduse_õppekava'){
                    $programmenode['programme_field']['field_amount_unit'] = 'EAP';
                }
                if($this->parse_key($programme->oppekavaLiik) == 'kutsehariduse_õppekava'){
                    $programmenode['programme_field']['field_amount_unit'] = 'EKAP';
                }
            }else{
                $message = t('Õppekavas @programmecode on portaali loendis puuduv väärtus @taxonomyvalue', array('@programmecode' => $programme->oppekavaKood, '@taxonomyvalue' => $programme->oppekavaLiik));
                \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppekava uuendamine', $message);
            }

            if(isset($programme->akadKraadDiplom)){
                if(isset($taxonomies['degreeordiploma'][$this->parse_key($programme->akadKraadDiplom)])){
                    $degreeordiplomavalue = $taxonomies['degreeordiploma'][$this->parse_key($programme->akadKraadDiplom)];
                    $programmenode['programme_field']['field_degree_or_diploma_awarded'] = $degreeordiplomavalue;
                }else{
                    $message = t('Õppekavas @programmecode on portaali loendis puuduv väärtus @taxonomyvalue', array('@programmecode' => $programme->oppekavaKood, '@taxonomyvalue' => $programme->akadKraadDiplom));
                    \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppekava uuendamine', $message);
                }
            }

            foreach($taxonomies['studyprogrammelevel'] as $level){
                $key = array_keys($level);
                if(isset($programme->ope)){
                    if($level[$key[0]] === $programme->ope){
                        $programmelevelvalue = $key[0];
                        $programmenode['programme_field']['field_study_programme_level'] = $programmelevelvalue;
                    }
                }
            }

            foreach($taxonomies['iscedf'] as $iscedf){
                $key = array_keys($iscedf);
                if(isset($programme->ryhmaKood)){
                    if($iscedf[$key[0]] === $programme->ryhmaKood){
                        $iscedfdetailed = $key[0];
                        $programmenode['programme_field']['field_iscedf_detailed'] = $iscedfdetailed;
                    }
                }
            }

            $langvalues = [];
            if(isset($programme->oppeKeeled)){
                foreach($programme->oppeKeeled->oppeKeel as $ehislanguage){
                    if(isset($taxonomies['teaching_language'][$this->parse_key($ehislanguage)])){
                        $langvalues[] = $taxonomies['teaching_language'][$this->parse_key($ehislanguage)];
                    }else{
                        $message = t('Õppekavas @programmecode on portaali loendis puuduv väärtus @taxonomyvalue', array('@programmecode' => $programme->oppekavaKood, '@taxonomyvalue' => $ehislanguage));
                        \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppekava uuendamine', $message);
                    }
                }
            }
            $programmenode['programme_field']['field_teaching_language'] = $langvalues;

            $specializationvalues = [];
            if(isset($programme->spetsialiseerumised)){
                foreach($programme->spetsialiseerumised->spetsialiseerumine as $specialization){
                    $specializationvalues[] = $specialization;
                }
            }
            $specializationvalue = implode(", ",$specializationvalues);
            $programmenode['programme_field']['field_specialization'] = $specializationvalue;

            if(isset($programme->maht)){
                $programmenode['programme_field']['field_amount'] = $programme->maht;
            }

            if(isset($programme->praktikaMaht)){
                $programmenode['programme_field']['field_practical_training_amount'] = $programme->praktikaMaht;
            }

            $duration_values = [];
            if(isset($programme->nominaalKestusAastad)){
                $duration_values[] = $programme->nominaalKestusAastad*12;
            }

            if(isset($programme->nominaalKestusKuud)){
                $duration_values[] = $programme->nominaalKestusKuud;
            }
            $programmenode['programme_field']['field_duration'] = array_sum($duration_values);

            if(isset($programme->vastuvott)){
                $programmenode['programme_field']['field_admission_status'] = $programme->vastuvott;
            }

            if(isset($programme->akrediteerimisOtsus)){
                $programmenode['programme_field']['field_accreditation_status'] = $programme->akrediteerimisOtsus;
            }

            if(isset($programme->akrediteerimiseKehtivusKuupaev)){
                $datefields = explode('.', $programme->akrediteerimiseKehtivusKuupaev);
                $programmenode['programme_field']['field_accreditation_valid_until']['value'] = $datefields[2].'-'.$datefields[1].'-'.$datefields[0];
            }

            if(isset($programme->kutsestandardid)){
                $qualidvalues = [];
                $qualidtaxonomies = [];
                foreach($programme->kutsestandardid->kutsestandardiIdentifikaator as $id){
                    if(isset($taxonomies['qual_id'][$id])){
                        $qualidvalues[] = $taxonomies['qual_id'][$id];
                    }else{
                        $qualidtaxonomies[] = $id;
                    }
                }
                if(count($qualidvalues) > 0){
                    $programmenode['programme_field']['field_qualification_standard_id'] = $qualidvalues;
                }
                if(count($qualidtaxonomies) > 0){
                    $programmenode['programme_taxonomy']['qualificationstandardid'] = $qualidtaxonomies;
                }
            }

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

    public function get_taxonomy_outputs($taxonomy, $outputfield){
        $query = \Drupal::entityQuery('taxonomy_term');
        $query->condition('vid', $taxonomy);
        $tids = $query->execute();
        $terms = \Drupal\taxonomy\Entity\Term::loadMultiple($tids);
        $terms_parsed = [];
        foreach($terms as $term){
            $outputs = $term->get($outputfield)->getValue();
            foreach($outputs as $output){
                $terms_parsed[] = [$term->id() => $output['value']];
            }
        }
        return $terms_parsed;
    }

    public function save_programme($programme){
        if(isset($programme['programme_field']['nid'])){
            $node_storage = \Drupal::entityManager()->getStorage('node');
            $node = $node_storage->load($programme['programme_field']['nid']);
        }else{
            $node = Node::create([
                'type' => 'study_programme',
                'langcode' => 'et',
                'created' => REQUEST_TIME,
                'changed' => REQUEST_TIME,
                'uid' => 1,
                'title' => sprintf('%s', $programme['programme_field']['title']),
            ]);
        }

        if($programme['action'] !== 'delete'){
            if(isset($programme['programme_field']['field_iscedf_detailed'])){
                $detailedparents = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadParents($programme['programme_field']['field_iscedf_detailed']);
                foreach($detailedparents as $parent){
                    $programme['programme_field']['field_iscedf_narrow'] = $parent->id();
                }
                $narrowparents = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadParents($programme['programme_field']['field_iscedf_narrow']);
                foreach($narrowparents as $parent){
                    $programme['programme_field']['field_iscedf_board'] = $parent->id();
                }
            }

            if(isset($programme['programme_taxonomy']['qualificationstandardid'])){
                foreach($programme['programme_taxonomy']['qualificationstandardid'] as $id){
                    $qualidterm = Term::create([
                        'name' => $id,
                        'vid' => 'qualificationstandardid',
                    ]);
                    $qualidterm->save();
                    $programme['programme_field']['field_qualification_standard_id'][] = $qualidterm->get('tid')->getValue()[0]['value'];
                }
            }

            if(isset($programme['programme_field']['field_educational_institution'])){
                $schoolitem = entity_load('node', $programme['programme_field']['field_educational_institution']);
                if(count($schoolitem->toArray()['field_school_location']) > 0){
                    $schoolitem->toArray()['field_school_location'][0]['target_id'];
                    $paragraph = entity_load('paragraph', $schoolitem->toArray()['field_school_location'][0]['target_id']);
                    $programme['programme_field']['field_school_address'] = $paragraph->get('field_address')->value;
                }
                if(count($schoolitem->toArray()['field_school_webpage_address']) > 0){
                    $programme['programme_field']['field_school_website'] = $schoolitem->toArray()['field_school_webpage_address'];
                }
            }

            foreach($programme['programme_field'] as $fieldlabel => $fieldvalue){
                $node->set($this->parse_key($fieldlabel), $fieldvalue);
            }

            $node->save();
        }else{
            $node->delete();
        }
    }

    public function unpublishNonExistantProgrammes($imported_programmes){
        $new_ehis_ids = [];
        $programme_nodes = [];
        foreach($imported_programmes as $programme){
            $new_ehis_ids[] = $programme->oppekavaKood;
        }
        $nids = \Drupal::entityQuery('node')
            ->condition('type', 'study_programme')
            ->execute();

        foreach($nids as $nid){
            $entity = \Drupal::entityTypeManager()->getStorage('node')->load($nid);
            if(count($entity->field_ehis_id->getValue()) == 0 || !in_array($entity->field_ehis_id->getValue()[0]['value'], $new_ehis_ids)){
                $programme_nodes[] = [
                    'programme_field' => [
                        'nid' => $entity->id(),
                        'status' => '0'
                    ]
                ];
            }
        }
        return $programme_nodes;
    }

    private function parse_key($key){
        return mb_strtolower(str_replace(' ', '_', $key));
    }
}
