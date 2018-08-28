<?php

namespace Drupal\htm_custom_subsidy_projects\Plugin\GraphQL\Fields\SubsidyQuery;

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
*   id = "custom_subsidy_project_query",
*   secure = true,
*   type = "[CustomSubsidy]",
*   name = "CustomSubsidyProjectQuery",
*   response_cache_contexts = {"languages:language_url"},
*   arguments = {
*     "ownerShipType" = "[Int]",
*     "investment_measure" = "[Int]",
*     "investment_deadline" = "[Int]",
*     "levelOfDetail" = "Int!"
*   }
* )
*/
class SubsidyQuery extends FieldPluginBase implements ContainerFactoryPluginInterface {
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

    dump($responsevalues);
    die();

  foreach($responsevalues as $value){
    foreach($value['_source'] as $key => $keyvalue){
      $value['_source'][StringHelper::camelCase($key)] = $keyvalue;
      unset($value['_source'][$key]);
    }
    yield $value['_source'];
  }
  //yield $this->getQuery($value, $args, $context, $info);
}

protected function getElasticQuery($args){

    $params = [
      'scroll' => '30s',
      'size' => 50,
      'index' => 'elasticsearch_index_drupaldb_subsidy_projects'
    ];

  foreach($args as $arglabel => $argvalues){
    foreach($argvalues as $argvalue){
      $elastic_should_filters[] = array(
        'match' => array(
          $arglabel => $argvalue
        )
      );
    }
  }

    $query = array(
      'query' => array(
        'bool' => array(
          'must' => array(
            'bool' => array(
              'should' => array(
                $elastic_should_filters
              )
            )
          )
        )
      )
    );

  $params['body'] = $query;

  return $params;
}

}
