<?php

namespace Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\Types;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type representing Drupal menus.
 *
 * @GraphQLType(
 *   id = "custom_elastic",
 *   name = "CustomElastic"
 * )
 */
class CustomElastic extends TypePluginBase {
}
