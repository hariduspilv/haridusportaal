<?php

namespace Drupal\graphql_custom_translation\Plugin\GraphQL\Types;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type representing Drupal menus.
 *
 * @GraphQLType(
 *   id = "custom_trans",
 *   name = "CustomTrans"
 * )
 */
class CustomTrans extends TypePluginBase {
}
