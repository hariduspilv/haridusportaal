<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Entity;

use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\graphql_metatag\Plugin\GraphQL\Fields\Entity\EntityMetatags;

/**
 * @GraphQLField(
 *   id = "entity_metatags",
 *   name = "entityMetatags",
 *   type = "[Metatag]",
 *   parents = {"Entity"},
 *   secure = true
 * )
 */
class CustomEntityMetatags extends EntityMetatags {

}
