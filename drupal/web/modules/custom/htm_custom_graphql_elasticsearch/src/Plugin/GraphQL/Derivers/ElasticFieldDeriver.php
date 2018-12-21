<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Derivers;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Elasticsearch\ClientBuilder;
use Drupal\graphql\Utility\StringHelper;
/**
 * Provides GraphQL Field plugin definitions for Elasticsearch index fields.
 */
class ElasticFieldDeriver extends DeriverBase {

    /**
     * List of derivative definitions.
     *
     * @var array
     */
    protected $derivatives = [];

    /**
     * {@inheritdoc}
     */
    public function getDerivativeDefinitions($base_plugin_definition) {

        $fields = $this->getFields();

        #remove entity:path field from deriver
        unset($fields[array_search('entity_path', $fields)]);

        if(count($fields) > 0){
            foreach($fields as $field){
                $field = $derivative['type'] = StringHelper::camelCase($field);
                $this->derivatives[$field] = $base_plugin_definition;
                $this->derivatives[$field]['name'] = $field;
                $this->derivatives[$field]['type'] = 'String';
            }

            return $this->derivatives;
        }else{
            $field = 'empty';
            $this->derivatives[$field] = $base_plugin_definition;
            $this->derivatives[$field]['name'] = $field;
            $this->derivatives[$field]['type'] = 'String';

            return $this->derivatives;
        }
    }

    public function getFields(){
        $fields = [];

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
        if($client->ping() == FALSE){
            return [];
        }else{
            $elasticindexes = $client->indices()->getAliases();
            $elasticmapping = $client->indices()->getMapping();

            foreach($elasticindexes as $elasticindex => $indexval){
                if(substr($elasticindex, 0, 1) !== "."){
                    $fieldsitem = reset($elasticmapping[$elasticindex]['mappings']);
                    if(isset($fieldsitem['properties'])){
                        foreach($fieldsitem['properties'] as $field => $type){
                            $fields[] = $field;
                        }
                    }
                }
            }
            return array_unique($fields);
        }
    }

}
