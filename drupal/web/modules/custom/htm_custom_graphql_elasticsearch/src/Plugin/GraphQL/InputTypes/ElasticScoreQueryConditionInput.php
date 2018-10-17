<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "elastic_score_query_condition_input",
 *   name = "ElasticScoreQueryConditionInput",
 *   fields = {
 *     "field" = "String!",
 *     "weight" = "Int!",
 *     "enabled" =  {
 *        "default"  = TRUE,
 *        "type" = "Boolean"
 *      }
 *   }
 * )
 */
class ElasticScoreQueryConditionInput extends InputTypePluginBase {

}
