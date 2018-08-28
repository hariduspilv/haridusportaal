<?php

namespace Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "elastic_score_query_input",
 *   name = "ElasticScoreQueryInput",
 *   fields = {
 *     "search_value" = "String!",
 *     "conditions" = "[ElasticScoreQueryConditionInput]"
 *   }
 * )
 */
class ElasticScoreQueryInput extends InputTypePluginBase {

}
