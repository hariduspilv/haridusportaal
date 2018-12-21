<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Types;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type representing Elasticsearch query.
 *
 * @GraphQLType(
 *   id = "custom_elastic",
 *   name = "CustomElastic"
 * )
 */
class CustomElastic extends TypePluginBase {
}
