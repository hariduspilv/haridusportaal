<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Elasticsearch\ClientBuilder;
use Drupal\graphql\GraphQL\Buffers\SubRequestBuffer;
use Drupal\graphql\Utility\StringHelper;


/**
 * @GraphQLField(
 *   id = "custom_study_programme_elasticsearch_query_2",
 *   secure = true,
 *   type = "CustomElasticQueryResult",
 *   name = "CustomStudyProgrammeElasticQuery2",
 *   response_cache_contexts = {"languages:language_url"},
 *   arguments = {
 *     "filter" = "CustomStudyProgrammeElasticFilterInput",
 *     "limit" = "Int",
 *     "offset" = "Int"
 *   }
 * )
 */
class StudyProgrammeElasticQuery2 extends FieldPluginBase implements ContainerFactoryPluginInterface {
    use DependencySerializationTrait;

    /**
     * The sub-request buffer service.
     *
     * @var \Drupal\graphql\GraphQL\Buffers\SubRequestBuffer
     */
    protected $subRequestBuffer;

    /**
     * {@inheritdoc}
     */
    public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
        return new static(
            $configuration,
            $pluginId,
            $pluginDefinition,
            $container->get('graphql.buffer.subrequest')
        );
    }

    /**
     * Metatags constructor.
     *
     * @param array $configuration
     *   The plugin configuration array.
     * @param string $pluginId
     *   The plugin id.
     * @param mixed $pluginDefinition
     *   The plugin definition array.
     */
    public function __construct(
        array $configuration,
        $pluginId,
        $pluginDefinition,
        SubRequestBuffer $subRequestBuffer
    ) {
        parent::__construct($configuration, $pluginId, $pluginDefinition);
        $this->subRequestBuffer = $subRequestBuffer;
    }

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
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

            yield ['count'=> $response['hits']['total'], 'values' => $responsevalues];
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
        if(isset($args['filter']['school_address']) && $args['filter']['school_address'] != ''){
            $location = $args['filter']['school_address'];
        }

        if(isset($language, $studyprogrammetype)){
            if(isset($iscedf_detailed)){
                $conditiongroups[] = array(
                    array(
                        'match' => array(
                            'field_study_programme_type' => $studyprogrammetype
                        )
                    ),
                    array(
                        'match' => array(
                            'field_teaching_language' => $language
                        )
                    ),
                    array(
                        'bool' => array(
                            'should' => array(
                                array(
                                    'match' => array(
                                        'field_iscedf_detailed' => $iscedf_detailed
                                    )
                                ),
                                array(
                                    'match' => array(
                                        'name' => $studyprogrammename
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
                            'field_study_programme_type' => $studyprogrammetype
                        )
                    ),
                    array(
                        'match' => array(
                            'field_teaching_language' => $language
                        )
                    ),
                    array(
                        'match' => array(
                            'name' => $studyprogrammename
                        )
                    )
                );
            }
        }else if(isset($studyprogrammetype) && !isset($language)){
            if(isset($iscedf_detailed)){
                $conditiongroups[] = array(
                    array(
                        'match' => array(
                            'field_study_programme_type' => $studyprogrammetype
                        )
                    ),
                    array(
                        'bool' => array(
                            'should' => array(
                                array(
                                    'match' => array(
                                        'field_iscedf_detailed' => $iscedf_detailed
                                    )
                                ),
                                array(
                                    'match' => array(
                                        'name' => $studyprogrammename
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
                            'field_study_programme_type' => $studyprogrammetype
                        )
                    ),
                    array(
                        'match' => array(
                            'name' => $studyprogrammename
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
                        'field_degree_or_diploma_awarded' => $degreeordiploma
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
                        'field_study_programme_level' => $studyprogrammelevel
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
                    'must' => array(
                        $conditiongroup
                    )
                )
            );
        }

        if(isset($location)){
            $values = explode(" ", $location);
            foreach($conditions as $key => $condition){
                foreach($values as $value){
                    $condition['bool']['must'][0][] = array(
                        'wildcard' => array(
                            'field_school_address' => '*'.str_replace(',', '', strtolower($value)).'*'
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
