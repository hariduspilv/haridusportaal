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


/**
 * @GraphQLField(
 *   id = "custom_elasticsearch_autocomplete_query",
 *   secure = true,
 *   type = "[CustomElastic]",
 *   name = "CustomElasticAutocompleteQuery",
 *   response_cache_contexts = {"languages:language_url"},
 *   arguments = {
 *     "elasticsearch_index" = "[String!]",
 *     "fields" = {
 *       "type" = "[String]",
 *       "default" = {"*"},
 *     },
 *     "search_input" = "String!",
 *     "content_type" = "[String]",
 *     "limit" = "Int",
 *   }
 * )
 */
class ElasticAutocompleteQuery extends FieldPluginBase implements ContainerFactoryPluginInterface {
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
    $this->autocomplete_values = [];
    $args['search_input'] = trim($args['search_input']);
    $this->search_input = $args['search_input'];
    $this->autocomplete_limit = $args['limit'];
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

    foreach($response['hits']['hits'] as $key => $value){
      if(isset($value['highlight'])){
        $highlights[] = $value['highlight'];
      }
    }

    $this->getAutocompleteValues($highlights);

    if(count($this->autocomplete_values) > 0){
      foreach($this->autocomplete_values as $value){
        yield ['Nid' => [$value]];
      }
    }
  }

  public function get_words($sentence, $count) {
    preg_match("/(?:\w+(?:\W+|$)){0,$count}/", $sentence, $matches);
    return $matches[0];
  }

  protected function getContentTypeLabels($responsevalues){
    $response = [];
    foreach($responsevalues as $value){
      if(isset($value['_source'])){
        $language = \Drupal::languageManager()->getLanguage($value['_source']['langcode'][0]);
        \Drupal::languageManager()->setConfigOverrideLanguage($language);
        $contentTypes = \Drupal::service('entity_type.manager')->getStorage('node_type')->loadByProperties(['type' => $value['_source']['content_type'][0]]);
        foreach($contentTypes as $type){
          $value['_source']['content_type'][0] = $type->label();
          $response[] = $value;
        }
      }
    }
    return $response;
  }

  protected function getElasticQuery($args){

    $score_fields = [];

    $params = [
      'index' => $args['elasticsearch_index']
    ];

    #$args['search_input'] = str_replace('-', ' ', $args['search_input']);

    foreach($args['fields'] as $value){
      $fields[$value] = [
        'pre_tags' => '<highl>',
        'post_tags' => '</highl>',
        'require_field_match' => false
      ];
    }

    $query = [
      'query' => [
        'bool'=>[
          'should'=>[
            'query_string' => [
              'query' => '*'.mb_strtolower($args['search_input']).'*',
            ]
          ]
        ]
      ],
//            'rescore' => [
//                'window_size' => 150,
//                'query' => [
//                    'rescore_query' => [
//                        'match_phrase' => [
//                            'title' => [
//                                'query' => mb_strtolower($args['search_input']),
//                                'slop' => 5
//                            ]
//                        ]
//                    ]
//                ]
//            ],
      'highlight' => [
        'order' => 'score',
        'fields' => $fields
      ]
    ];
    $query = [
      'query'=>[
        'bool' => [
          'should' => [
            'query_string' => [
              'query' => '*' . mb_strtolower($args['search_input']) . '*'
            ]
          ]
        ]
      ],
      'rescore' => [
        'window_size' => 150,
        'query' => [
          'rescore_query' => [
            'match_phrase' => [
              'title' => [
                'query' => mb_strtolower($args['search_input']),
                'slop' => 5
              ]
            ]
          ]
        ]
      ],
      'highlight' => [
        'order' => 'score',
        'fields' => $fields
      ]
    ];
    if ($args['content_type']){
      foreach ($args['content_type'] as $cont_type){
        $query['query']['bool']['filter']['terms']['type'][]=$cont_type;
      }
    }

    $params['body'] = $query;
    if ($args['limit']){
      $params['size']= $args['limit'];
    }
    return $params;
  }

  protected function getAutocompleteValues($highlights){
    array_walk_recursive($highlights, 'self::getAutocompleteCandidates');
  }

  protected function getAutocompleteCandidates($item, $key){
    $regex = '/<highl>(.*?)<\/highl>/';
    preg_match_all($regex, $item, $matches);
    $matches[0] = array_unique($matches[0]);
    $item = array_unique(explode(" ", $item));
    $item_length = count($item);
    if(count($matches[0]) == count(preg_split('/\s+/', $this->search_input))){
      foreach($matches[0] as $match){
        if(mb_strlen($match) < 50){
          $array_locations[] = key(preg_grep('/'.strip_tags($match).'/i', $item));
        }
      }

      if(isset($array_locations)){
        #sort the array so the order won't get mixed up
        asort($array_locations);

        $matches_count = count($array_locations);

        if(isset($array_locations) && $matches_count <= 4){

          if($matches_count == 1){

            foreach($array_locations as $location){
              $location_position = $location;
              $location_count = 0;
              if($location != $item_length && $location != 0){
//                                $array_locations[] = $location-1;
                $array_locations[] = $location+1;
              }elseif($location == $item_length){
                while($location_position >= 0 && $location_count <= 2){
                  $location_position--;
                  $location_count++;
                  $array_locations[] = $location_position;
                }
              }elseif($location == 0){
                while($location_position <= $item_length && $location_count <= 2){
                  $location_position++;
                  $location_count++;
                  $array_locations[] = $location_position;
                }
              }
            }

          }else{
            $range_start = reset($array_locations);
            $range_end = end($array_locations);
            if($range_end - $range_start <= 2){
              if($range_start > 0){
                $range_start--;
              }
              if($range_end < count($item)){
                $range_end++;
              }
              $array_locations = range($range_start, $range_end);
            }

          }

          if(count($array_locations) > $this->autocomplete_limit){
            array_splice($array_locations, $this->autocomplete_limit);
          }

          #clean values for output and extract only values, that are needed for output
          foreach($array_locations as $location){
            if(isset($item[$location])){
              $autocomplete_value_items[] = strip_tags($item[$location]);
            }
          }

          $mandatory_args = explode(" ", $this->search_input);
          $autocomplete_value = trim(implode(" ", $autocomplete_value_items));
          $correct_value = true;
          foreach($mandatory_args as $value){
            if(fnmatch(mb_strtolower('*'.$value.'*'), mb_strtolower($autocomplete_value)) == false){
              $correct_value = false;
            }
          }

          if($correct_value == true && !in_array($autocomplete_value, $this->autocomplete_values)){
            $this->autocomplete_values[] = trim($autocomplete_value);
          }

        }
      }
    }
  }
}
