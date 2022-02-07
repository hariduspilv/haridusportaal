<?php
namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Elasticsearch\Client;
use Symfony\Component\DependencyInjection\ContainerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Elasticsearch\ClientBuilder;
use Drupal\graphql\GraphQL\Buffers\SubRequestBuffer;
use Drupal\graphql\Utility\StringHelper;
/**
 * @GraphQLField(
 *   id = "custom_elasticsearch_query",
 *   secure = true,
 *   type = "[CustomElasticQueryResult]",
 *   name = "CustomElasticQuery",
 *   response_cache_contexts = {"languages:language_url"},
 *   arguments = {
 *     "filter" = "EntityQueryFilterInput",
 *     "elasticsearch_index" = "[String!]",
 *     "content_type" = "Boolean",
 *     "sortField" = "String",
 *     "sortDirection" = {
 *        "type" = "SortOrder"
 *     },
 *     "limit" = "Int",
 *     "score" = "ElasticScoreQueryInput",
 *     "offset" = "Int"
 *   }
 * )
 */
class ElasticQuery extends FieldPluginBase implements ContainerFactoryPluginInterface
{
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
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition)
  {
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
  )
  {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->subRequestBuffer = $subRequestBuffer;
  }
  /**
   * {@inheritdoc}
   */
  public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info)
  {
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

    $elasticsearch_indexes =  \Drupal::entityTypeManager()->getStorage('search_api_index')->loadMultiple();
    $index_out = '';
    foreach ($elasticsearch_indexes as $elasticsearch_index_name=> $elasticsearch_index){
      if ($elasticsearch_index_name == 'oska_profession_autocomplete' ){
        continue;
      }
      if (empty($index_out)){
        $index_out.='elasticsearch_index_drupaldb_'.$elasticsearch_index_name;
      }
      else{
        $index_out.=',elasticsearch_index_drupaldb_'.$elasticsearch_index_name;
      }
    }

    if (isset($args['sort'])) $args = $this->parseElasticSort($args, $client);
    $params = $this->getElasticQuery($args);
    \Drupal::logger('elastic')->notice('<pre><code>PARAMS: ' . print_r($params, TRUE) . '</code></pre>' );
    if (empty($params['index'])) {
      $params['index'] = $index_out;
    }
    // add sort if set
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
  protected function getContentTypeLabels($responsevalues)
  {
    $response = [];
    foreach ($responsevalues as $value) {
      if (isset($value['_source'])) {
        $language = \Drupal::languageManager()->getLanguage($value['_source']['langcode'][0]);
        \Drupal::languageManager()->setConfigOverrideLanguage($language);
        $contentTypes = \Drupal::service('entity_type.manager')->getStorage('node_type')->loadByProperties(['type' => $value['_source']['content_type'][0]]);
        foreach ($contentTypes as $type) {
          $value['_source']['content_type'][0] = $type->label();
          $response[] = $value;
        }
      }
    }
    return $response;
  }
  protected function getElasticQuery($args)
  {
    if (is_null($args['offset']) && is_null($args['limit'])) {
      $params = [
        'scroll' => '30s',
        'size' => 50,
        'index' => $args['elasticsearch_index']
      ];
    } else {
      $params = [
        'from' => $args['offset'],
        'size' => $args['limit'],
        'index' => $args['elasticsearch_index']
      ];
    }

    if ($args['filter']['conjunction'] === 'AND') {
      foreach ($args['filter']['conditions'] as $condition) {
        if ((isset($condition['enabled']) && $condition['enabled'] === true) || (!isset($condition['enabled']))) {
          switch ($condition['operator']) {
            case '=':
              foreach ($condition['value'] as $value) {
                if ($condition['field']=='langcode'){
                  $value = strtolower($value);
                }
                $elastic_must_filters[] = array(
                  'match' => array(
                    $condition['field'] => $value
                  )
                );
              }
              break;
            case 'LIKE':
              $value = $condition['value'][0];
              if ($condition['field']=='langcode'){
                $value = strtolower($value);
              }
              $elastic_must_filters[] = array(
                'query_string' => array(
                  'query' => '*'.mb_strtolower($value).'*',
                  'fields' => array(
                    $condition['field']
                  ),
                  'default_operator' => 'AND'
                )
              );
              break;
            case 'IN':
              if (isset($condition['value'])) {
                $elastic_must_filters[] = array(
                  'terms' => array(
                    $condition['field'] => $condition['value']
                  )
                );
              }
              break;
            case 'FUZZY':
              foreach ($condition['value'] as $value) {
                $elastic_must_filters[] = array(
                  'match' => array(
                    $condition['field'] => array(
                      'query' => $value,
                      'fuzziness' => 'AUTO',
                      'analyzer'=>'synonym'
                    )
                  )
                );
              }
              break;
          }
        }
      }
    }

    if ($args['filter']['groups'][0]['conjunction'] === 'OR') {
      foreach ($args['filter']['groups'][0]['conditions'] as $condition) {
        if ((isset($condition['enabled']) && $condition['enabled'] === true) || (!isset($condition['enabled']))) {
          switch ($condition['operator']) {
            case 'LIKE':
              $value = $condition['value'][0];
              if ($condition['field']=='langcode'){
                $value = strtolower($value);
              }
              // wildcard query string for OR conjunction
              $elastic_should_filters[] = array(
                'query_string' => array(
                  'query' => '*'.mb_strtolower($value).'*',
                  'fields' => array(
                    $condition['field']
                  ),
                  'default_operator' => 'AND'
                )
              );
              // synonym query for OR conjunction
              $elastic_should_filters[] = array(
                'match' => array(
                  $condition['field'] => array(
                    'query' => mb_strtolower($value),
//                    'fuzziness' => 'AUTO',
                    'analyzer'=>'synonym',
                    'operator' => 'AND'
                  )
                )
              );
              break;
            case 'IN':
              if (isset($condition['value'])) {
                $elastic_should_filters[] = array(
                  'terms' => array(
                    $condition['field'] => $condition['value']
                  )
                );
              }
              break;
            case 'FUZZY':
              foreach ($condition['value'] as $value) {
                $elastic_should_filters[] = array(
                  'match' => array(
                    $condition['field'] => array(
                      'query' => $value,
                      'fuzziness' => 'AUTO',
                      'analyzer'=>'synonym'
                    )
                  )
                );
              }
              break;
          }
        }
      }
    }

    // Filters & Synonyms for AND conjunction
    foreach ($args['score']['conditions'] as $condition) {
      $elastic_should_filters[] = array(
        'query_string' => array(
          'query' => '*'.mb_strtolower($args['score']['search_value']).'*',
          'fields' => array(
            $condition['field']
          ),
          'default_operator' => 'AND'
        )
      );
      $elastic_should_filters[] = array(
        'match' => array(
          $condition['field'] => array(
            'query' => mb_strtolower($args['score']['search_value']),
//            'fuzziness' => 'AUTO',
            'analyzer'=>'synonym',
            'operator' => 'AND'
          )
        )
      );
    }

    // If score is set (only applies to AND conjunction)
    if (isset($args['score'])) {
      $query = array(
        'query' => array(
          'bool' => array(
            'must' => $elastic_must_filters,
            'should' => $elastic_should_filters,
            'minimum_should_match' => 1
          )
        )
      );

      // if no score is set, conjunction === OR & possibly AND (search by must and should, ex. only text search or text search and filters together)
    } else if(!isset($args['score']) && isset($elastic_should_filters)) {
      $query = array(
        'query' => array(
          'bool' => array(
            'must' => $elastic_must_filters,
            'should' => $elastic_should_filters,
            'minimum_should_match' => 1,
          )
        ),
      );
      if ($args['sort']) {
        $query['sort'] = $args['sort'];
      }
    }
    // if no score is set & conjunction === AND, but not OR (only search by must, ex. only filters and no text search)
    else if(!isset($args['score']) && isset($elastic_must_filters) && !isset($elastic_should_filters)) {
      $query = array(
        'query' => array(
          'bool' => array(
            'must' => $elastic_must_filters
          )
        ),
      );
      if ($args['sort']) {
        $query['sort'] = $args['sort'];
      }
    }

    $params['body'] = $query;

    // Sort by sortfield, if it has value. NB: to enable sorting for text fields, '.keyword' needs to be added to the end of the field name
    if(!empty($args['sortField'])) {
      if($args['sortField'] === 'title') {
        $args['sortField'] = 'title.keyword';
      }
      $params['body']['sort'] = [$args['sortField'] => ['order' => $args['sortDirection']]];
    }

    return $params;
  }
  protected function getSynonyms() {
    $config = \Drupal::config('search_api_elasticsearch_synonym.settings');
    $synonyms_array = preg_split("/\r\n|\n|\r/",$config->get('synonyms'));
    $synonyms = array();

    foreach ($synonyms_array as $synonyms_line) {
      $parts = explode("#", $synonyms_line);

      if (!empty($parts[0])) {
        $synonyms[] = $parts[0];
      }
    }

    return $synonyms;
  }
  protected function parseElasticSort($args, Client $client)
  {
    $index = reset($args['elasticsearch_index']);
    $sort_params = $args['sort'];
    $params = ['index' => $index];
    foreach ($sort_params as $param) {
//      $params['field'][] = $param['field'];
      $params['fields'][] = $param['field'];
    }
    $mapping = $client->indices()->getFieldMapping($params);
    $mapping_arr = reset($mapping[$index]['mappings']);
    $changed = false;
    $parsed_params = [];
    foreach ($sort_params as &$sort_param) {
      if (isset($mapping_arr[$sort_param['field']])) {
        $sort_field = $sort_param['field'];
        $field_mapping = $mapping_arr[$sort_field];
        $key = $sort_param['field'];
        if (isset($field_mapping['mapping'][$sort_field]['fields']['keyword'])) {
          $key = $sort_param['field'] . '.keyword';
        }
        $parsed_params[$key] = ($sort_param['direction']) ? $sort_param['direction'] : 'ASC';
        $changed = true;
      }
    }
    $args['sort'] = ($changed) ? $parsed_params : [];
    return $args;
  }
}
