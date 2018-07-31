<?php

namespace Drupal\custom_graphql_taxonomy_query\Plugin\GraphQL\Derivers;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Elasticsearch\ClientBuilder;
use Drupal\graphql\Utility\StringHelper;
use Drupal\taxonomy\TermStorage;

/**
 * Provides GraphQL Field plugin definitions for Elasticsearch index fields.
 */
class TaxonomyFieldDeriver extends DeriverBase {

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

    foreach($fields as $field){
      $field = $derivative['type'] = StringHelper::camelCase($field);
      $this->derivatives[$field] = $base_plugin_definition;
      $this->derivatives[$field]['name'] = $field;
      $this->derivatives[$field]['type'] = 'String';
    }

    return $this->derivatives;
  }

  public function getFields(){
    $jou = \TermStorage::loadTree();
    
  }

}
