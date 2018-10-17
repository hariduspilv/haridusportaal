<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "custom_elasticsearch_filter_input",
 *   name = "CustomElasticFilterInput",
 *   fields = {
 *     "index" = "String!"
 *   }
 * )
 */
class ElasticFilterInput extends InputTypePluginBase {

}
