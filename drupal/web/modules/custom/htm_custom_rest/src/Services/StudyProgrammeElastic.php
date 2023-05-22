<?php

namespace Drupal\htm_custom_rest\Services;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use GraphQL\Type\Definition\ResolveInfo;
use Elasticsearch\ClientBuilder;


class StudyProgrammeElastic  {


  public function similarSearch($params) {
    $args = [];
    if (!empty($params['nid'])){
      $args['filter']['nid'] = $params['nid'];
    }
    if (!empty($params['address'])){
     $args['filter']['school_search_address'] = $params['address'];
    }
    if (!empty($params['elasticsearch_index'])) {
      $args['elasticsearch_index'] = $params['elasticsearch_index'];
    }
    if (!empty($params['offset'])) {
      $args['offset'] = $params['offset'];
    }
    else{
      $args['offset'] = 0;
    }
    if (!empty($params['limit'])) {
      $args['limit'] = $params['limit'];
    }
    if (!empty($params['sortField'])) {
      $args['sortField'] = $params['sortField'];
    }
    if (!empty($params['sortDirection'])) {
      $args['sortDirection'] = $params['sortDirection'];
    }
    $values = $this->resolveValues($args);
    return  $values;
  }
    /**
     * {@inheritdoc}
     */
    public function resolveValues(array $args) {
        $responsevalues = [];

        $elasticsearch_path = \Drupal::config('elasticsearch_connector.cluster.elasticsearch_cluster')->get('url');
        $elasticsearch_user = \Drupal::config('elasticsearch_connector.cluster.elasticsearch_cluster')->get('options')['username'];
        $elasticsearch_pass = \Drupal::config('elasticsearch_connector.cluster.elasticsearch_cluster')->get('options')['password'];

        $hosts = [
            [
                'host' => parse_url($elasticsearch_path)['host'],
                'user' => $elasticsearch_user,
                'pass' => $elasticsearch_pass
            ]
        ];
        $client = ClientBuilder::create()->setSSLVerification(false)->setHosts($hosts)->build();
        $params = $this->getElasticQuery($args);
        \Drupal::logger('elastic_params')->debug(print_r($params,TRUE));
      if($params == NULL){
            return NULL;
        }else{
            $response = $client->search($params);

          if($args['offset'] == null && $args['limit'] == null){
                while (isset($response['hits']['hits']) && count($response['hits']['hits']) > 0) {

                    $responsevalues = array_merge($responsevalues, $response['hits']['hits']);

                    // When done, get the new scroll_id
                    // You must always refresh your _scroll_id!  It can change sometimes
                    $scroll_id = $response['_scroll_id'];

                    // Execute a Scroll request and repeat
                    $response = $client->scroll([
                            "scroll_id" => $scroll_id,  //...using our previously obtained _scroll_id
                            "scroll" => "30s"           // and the same timeout window
                        ]
                    );
                }
            }else{
                $responsevalues = array_merge($responsevalues, $response['hits']['hits']);
            }
            return ['count'=> $response['hits']['total'], 'values' => $responsevalues];
        }
    }

    protected function getElasticQuery($args){

        if(is_null($args['offset']) && is_null($args['limit'])){
            $params = [
                'scroll' => '30s',
                'size' => 50,
                'index' => 'elasticsearch_index_drupaldb_study_programmes'
            ];
        }else{
            $params = [
                'from' => $args['offset'],
                'size' => $args['limit'],
                'index' => 'elasticsearch_index_drupaldb_study_programmes'
            ];
        }

        $studyprogramme = \Drupal::entityTypeManager()->getStorage('node')->load($args['filter']['nid'])->toArray();
        $studyprogrammename = $studyprogramme['title'][0]['value'];
        if(count($studyprogramme['field_study_programme_type']) > 0){
            $studyprogrammetype = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($studyprogramme['field_study_programme_type'][0]['target_id'])->label();
        }
        if(count($studyprogramme['field_study_programme_level']) > 0){
            $studyprogrammelevel = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($studyprogramme['field_study_programme_level'][0]['target_id'])->label();
        }
        if(count($studyprogramme['field_teaching_language']) == 1){
            $language = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($studyprogramme['field_teaching_language'][0]['target_id'])->id();
        }
        if(count($studyprogramme['field_iscedf_detailed']) > 0){
            $iscedf_detailed = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($studyprogramme['field_iscedf_detailed'][0]['target_id'])->label();
        }
        if(count($studyprogramme['field_degree_or_diploma_awarded']) > 0){
            $degreeordiploma = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($studyprogramme['field_degree_or_diploma_awarded'][0]['target_id'])->label();
        }
        if(count($studyprogramme['field_amount']) > 0){
            $amount = $studyprogramme['field_amount'][0]['value'];
        }
        if(isset($args['filter']['school_search_address']) && $args['filter']['school_search_address'] != ''){
            $location = $args['filter']['school_search_address'];
        }

        if(isset($language, $studyprogrammetype)){
            if(isset($iscedf_detailed)){
                $conditiongroups[] = array(
                    array(
                        'match' => array(
                            'field_study_programme_type' => mb_strtolower($studyprogrammetype)
                        )
                    ),
                    array(
                        'match' => array(
                            'field_teaching_language' => mb_strtolower($language)
                        )
                    ),
                    array(
                        'bool' => array(
                            'should' => array(
                                array(
                                    'match' => array(
                                        'field_iscedf_detailed' => mb_strtolower($iscedf_detailed)
                                    )
                                ),
                                array(
                                    'match' => array(
                                        'name' => mb_strtolower($studyprogrammename)
                                    )
                                )
                            )
                        )
                    )
                );
            }else{
                $conditiongroups[] = array(
                    array(
                        'match' => array(
                            'field_study_programme_type' => mb_strtolower($studyprogrammetype)
                        )
                    ),
                    array(
                        'match' => array(
                            'field_teaching_language' => mb_strtolower($language)
                        )
                    ),
                    array(
                        'match' => array(
                            'name' => mb_strtolower($studyprogrammename)
                        )
                    )
                );
            }
        }else if(isset($studyprogrammetype) && !isset($language)){
            if(isset($iscedf_detailed)){
                $conditiongroups[] = array(
                    array(
                        'match' => array(
                            'field_study_programme_type' => mb_strtolower($studyprogrammetype)
                        )
                    ),
                    array(
                        'bool' => array(
                            'should' => array(
                                array(
                                    'match' => array(
                                        'field_iscedf_detailed' => mb_strtolower($iscedf_detailed)
                                    )
                                ),
                                array(
                                    'match' => array(
                                        'name' => mb_strtolower($studyprogrammename)
                                    )
                                )
                            )
                        )
                    )
                );
            }else{
                $conditiongroups[] = array(
                    array(
                        'match' => array(
                            'field_study_programme_type' => mb_strtolower($studyprogrammetype)
                        )
                    ),
                    array(
                        'match' => array(
                            'name' => mb_strtolower($studyprogrammename)
                        )
                    )
                );
            }
        }else{
            return NULL;
        }

        $functions = [];

        if(isset($degreeordiploma)){
            $functions[] = array(
                'filter' => array(
                    'match' => array(
                        'field_degree_or_diploma_awarded' => mb_strtolower($degreeordiploma)
                    )
                ),
                'weight' => 3
            );
        }

        if(isset($amount)){
            $functions[] = array(
                'filter' => array(
                    'match' => array(
                        'field_amount' => $amount
                    )
                ),
                'weight' => 2
            );
        }
        if(isset($studyprogrammelevel)){
            $functions[] = array(
                'filter' => array(
                    'match' => array(
                        'field_study_programme_level' => mb_strtolower($studyprogrammelevel)
                    )
                ),
                'weight' => 2
            );
        }
        if(count($studyprogramme['field_qualification_standard_id']) > 0){
            foreach($studyprogramme['field_qualification_standard_id'] as $id){
                $qual_standard_ids[] = array(
                    'filter' => array(
                        'match' => array(
                            'field_qualification_standard_id' => $id['target_id']
                        )
                    ),
                    'weight' => 3
                );
            }
            foreach($qual_standard_ids as $standard_id){
                $functions[] = $standard_id;
            }
        }

        foreach($conditiongroups as $conditiongroup){
            $conditions[] = array(
                'bool' => array(
                    'must' => $conditiongroup
                )
            );
        }

        if(isset($location)){
          $values = explode(" ", $location);
          foreach($conditions as $key => $condition){
                foreach($values as $value){
                    $condition['bool']['must'][0] = array(
                        'wildcard' => array(
                            'field_school_search_address' => '*'.str_replace(',', '', mb_strtolower($value)).'*'
                        )
                    );
                }
                $conditions[$key] = $condition;
          }
        }

        $query = array(
            'query' => array(
                'function_score' => array(
                    'query' => array(
                        'bool' => array(
                            'should' => $conditions,
                            'must_not' => [
                                'match' => [
                                    'nid' => $args['filter']['nid']
                                ]
                            ]
                        )
                    ),
                    'boost' => '1',
                    'functions' => $functions,
                    'score_mode' => 'sum',
                    'boost_mode' => 'replace'
                )
            ),
            'sort' => array(
                '_score'
            )
        );

        $params['body'] = $query;
      return $params;
    }

}
