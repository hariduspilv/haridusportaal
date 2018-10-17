<?php

namespace Drupal\htm_custom_graphql_tags\Plugin\GraphQL\Types;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type representing Drupal menus.
 *
 * @GraphQLType(
 *   id = "custom_tags",
 *   name = "CustomTags"
 * )
 */
class CustomTags extends TypePluginBase {
}
