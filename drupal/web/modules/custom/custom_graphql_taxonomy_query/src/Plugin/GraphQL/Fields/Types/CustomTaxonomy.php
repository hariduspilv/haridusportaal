<?php

namespace Drupal\custom_graphql_taxonomy_query\Plugin\GraphQL\Types;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type representing Drupal menus.
 *
 * @GraphQLType(
 *   id = "custom_taxonomy",
 *   name = "CustomTaxonomy"
 * )
 */
class CustomTaxonomy extends TypePluginBase {
}
