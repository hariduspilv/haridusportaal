<?php

namespace Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\Derivers;
use Drupal\Component\Plugin\Derivative\DeriverBase;
use Elasticsearch\ClientBuilder;
use Drupal\graphql\Utility\StringHelper;
/**
 * Provides GraphQL Field plugin definitions for Search API fields.
 */
class ElasticFieldDeriver extends DeriverBase {
  /**
   * Constructs a new Search API field.
   */
  public function __construct() {
  }
  /**
   * {@inheritdoc}
   */
  public function getDerivativeDefinitions($base_plugin_definition) {

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
    $elasticindexes = $client->indices()->getAliases();
    foreach($elasticindexes as $index => $value){
      if(substr($index, 0, 1) !== "."){
        $indexfields = reset(reset(reset($client->indices()->getMapping()[$index])));
        foreach($indexfields as $key => $value){
          $fields[] = $key;
        }
      }
    }

    foreach($fields as $field){
      $field = $derivative['type'] = StringHelper::camelCase($field);
      $this->derivatives[$field] = $base_plugin_definition;
      $this->derivatives[$field]['name'] = $field;
      $this->derivatives[$field]['type'] = 'String';
    }

    return $this->derivatives;
  }
}
