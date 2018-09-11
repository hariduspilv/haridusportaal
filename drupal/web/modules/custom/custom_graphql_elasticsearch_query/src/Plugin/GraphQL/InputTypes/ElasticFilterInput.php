<?php

namespace Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\InputTypes;

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
