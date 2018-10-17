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
*   id = "custom_elasticsearch_query",
*   secure = true,
*   type = "[CustomElastic]",
*   name = "CustomElasticQuery",
*   response_cache_contexts = {"languages:language_url"},
*   arguments = {
*     "filter" = "EntityQueryFilterInput",
*     "elasticsearch_index" = "[String!]",
*     "content_type" = "Boolean",
*     "sort" = "[EntityQuerySortInput]",
*     "limit" = "Int",
*     "score" = "ElasticScoreQueryInput",
*     "offset" = "Int"
*   }
* )
*/
class ElasticQuery extends FieldPluginBase implements ContainerFactoryPluginInterface {
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
  if(isset($args['content_type']) && $args['content_type'] == true){
    $responsevalues = $this->getContentTypeLabels($responsevalues);
  }
  foreach($responsevalues as $value){
    foreach($value['_source'] as $key => $keyvalue){
      $value['_source'][StringHelper::camelCase($key)] = $keyvalue;
      unset($value['_source'][$key]);
    }
    yield $value['_source'];
  }
  //yield $this->getQuery($value, $args, $context, $info);
}

protected function getContentTypeLabels($responsevalues){
  foreach($responsevalues as $value){
    if(isset($value['_source'])){
      $language = \Drupal::languageManager()->getLanguage($value['_source']['langcode'][0]);
      \Drupal::languageManager()->setConfigOverrideLanguage($language);
      $contentTypes = \Drupal::service('entity.manager')->getStorage('node_type')->loadByProperties(['type' => $value['_source']['content_type'][0]]);
      foreach($contentTypes as $type){
        $value['_source']['content_type'][0] = $type->label();
        $response[] = $value;
      }
    }
  }
  return $response;
}

protected function getElasticQuery($args){
  if(is_null($args['offset']) && is_null($args['limit'])){
    $params = [
      'scroll' => '30s',
      'size' => 50,
      'index' => $args['elasticsearch_index']
    ];
  }else{
    $params = [
      'from' => $args['offset'],
      'size' => $args['limit'],
      'index' => $args['elasticsearch_index']
    ];
  }

  if($args['filter']['conjunction'] == 'AND'){
    foreach($args['filter']['conditions'] as $condition){
      if(isset($condition['enabled']) && $condition['enabled'] == true || !isset($condition['enabled'])){
        switch($condition['operator']){
          case '=':
          foreach($condition['value'] as $value){
            $elastic_must_filters[] = array(
              'match' => array(
                $condition['field'] => $value
              )
            );
          }
          break;
          case 'LIKE':
          $values = explode(" ", $condition['value'][0]);
          foreach($values as $value){
            $elastic_must_filters[] = array(
              'wildcard' => array(
                $condition['field'] => '*'.str_replace(',', '', strtolower($value)).'*'
              )
            );
          }
          break;
          case 'IN':
          if(isset($condition['value'])){
            $elastic_must_filters[] = array(
              'terms' => array(
                $condition['field'] => $condition['value']
              )
            );
          }
          break;
          case 'FUZZY':
          foreach($condition['value'] as $value){
            $elastic_must_filters[] = array(
              'match' => array(
                $condition['field'] => array(
                  'query' => $value,
                  'fuzziness' => 2
                )
              )
            );
          }
          break;
        }
      }
    }
  }
  if(isset($args['score'])){
    $searchvalues = explode(" ", $args['score']['search_value']);
    foreach($args['score']['conditions'] as $condition){
      foreach($searchvalues as $searchvalue){
        if(strlen($searchvalue) > 2){
          $functions[] = array(
            'filter' => array(
              'match' => array(
                $condition['field'] => str_replace(',', '', $searchvalue)
              )
            ),
            'weight' => $condition['weight']
          );
        }
      }
    }

    $query = array(
      'query' => array(
        'function_score' => array(
          'query' => array(
            'bool' => array(
              'must' => $elastic_must_filters
            )
          ),
          'boost' => '1',
          'functions' => $functions,
          'score_mode' => 'sum',
          'boost_mode' => 'replace',
          'min_score' => 2
        )
      ),
      'sort' => array(
        '_score'
      )
    );
  }else{
    $query = array(
      'query' => array(
        'bool' => array(
          'must' => array(
            $elastic_must_filters
          )
        )
      )
    );
  }

  $params['body'] = $query;

  return $params;
}

}
