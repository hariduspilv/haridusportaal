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
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\taxonomy\Entity\Term;


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
*     "detail" = "Int!"
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
    $ehis_ids = [];

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

    dump($response);
    die();

    if($response['hits']['total'] > 0){
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

    foreach($responsevalues as $value){
      if(!in_array($value['_source']['ehis_id'][0], $ehis_ids)){
        $ehis_ids[] = $value['_source']['ehis_id'][0];
      }
    }

    $schools = $this->getSchoolsByEhisId($ehis_ids);
    if($args['detail'] == 1 || $args['detail'] == 2){
      switch($args['detail']){
        case 1:
          $locations = $this->getCountys($schools);
          break;
        case 2:
          $locations = $this->getLocalGovs($schools);
          break;
      }
      foreach($responsevalues as $value){
        $ehis_id = $value['_source']['ehis_id'][0];
        if(isset($locations[$ehis_id])){
          $sums[$locations[$ehis_id]] += $value['_source']['investment_amount'][0];
        }
      }

      foreach($sums as $location => $sum){
        $statisticvalue['investmentLocation'] = $location;
        $statisticvalue['investmentAmountSum'] = $sum;
        yield $statisticvalue;
      }
    }
    if($args['detail'] == 3){

    }
  }
}

protected function getElasticQuery($args){

  $params = [
    'scroll' => '30s',
    'size' => 50,
    'index' => 'elasticsearch_index_drupaldb_subsidy_projects'
  ];

  foreach($args as $arglabel => $argvalues){
    if(count($argvalues) > 1){
      foreach($argvalues as $argvalue){
        $elastic_should_filters[] = array(
          'match' => array(
            $arglabel => $argvalue
          )
        );
      }
    }else{
      foreach($argvalues as $argvalue){
        $elastic_must_filters[] = array(
          'term' => array(
            $arglabel => $argvalue
          )
        );
      }
    }
  }

  $query = array(
    'query' => array(
      'bool' => array(
        'should' => $elastic_should_filters,
        'filter' => $elastic_must_filters
      )
    )
  );

  $params['body'] = $query;

  return $params;
}

protected function getLocationTaxonomyId($school){
  $paragraph_id = $school->get('field_school_location')->getValue()[0]['target_id'];
  $paragraph = Paragraph::load($paragraph_id);
  $taxonomy_term_id = $paragraph->get('field_school_location')->getValue()[0]['target_id'];

  return $taxonomy_term_id;
}

protected function getCountys($schools){
  $countys = [];
  foreach($schools as $school){
    $taxonomy_term_id = $this->getLocationTaxonomyId($school);
    $parents = \Drupal::service('entity_type.manager')->getStorage("taxonomy_term")->loadAllParents($taxonomy_term_id);
    $county = end($parents)->getName();
    $ehis_id = $school->field_ehis_id->getValue()[0]['value'];
    $countys[$ehis_id] = $county;
  }
  return $countys;
}

protected function getLocalGovs($schools){
  $localgovs = [];
  foreach($schools as $school){
    $taxonomy_term_id = $this->getLocationTaxonomyId($school);
    $parents = \Drupal::service('entity_type.manager')->getStorage("taxonomy_term")->loadAllParents($taxonomy_term_id);
    $keys = array_keys($parents);
    $key = $keys[1];
    $localgov = $parents[$key]->getName();
    $ehis_id = $school->field_ehis_id->getValue()[0]['value'];
    $localgovs[$ehis_id] = $localgov;
  }
  return $localgovs;
}

protected function getSchoolsByEhisId($ehis_ids){
  $nid_result = \Drupal::entityQuery('node')
  ->condition('type', 'school')
  ->condition('field_ehis_id', $ehis_ids, 'IN')
  ->execute();

  $schools = \Drupal::entityManager()->getStorage('node')->loadMultiple($nid_result);

  return $schools;
}

}
