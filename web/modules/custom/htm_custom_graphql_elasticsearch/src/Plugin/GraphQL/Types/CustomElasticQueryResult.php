<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Types;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type representing Elasticsearch query.
 *
 * @GraphQLType(
 *   id = "custom_elastic_query_result",
 *   name = "CustomElasticQueryResult"
 * )
 */
class CustomElasticQueryResult extends TypePluginBase {
}
