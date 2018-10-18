<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Entity;

use Drupal\graphql_metatag\Plugin\GraphQL\Fields\Entity\EntityMetatags;

/**
 * @GraphQLField(
 *   id = "custom_entity_metatags",
 *   name = "entityMetatags",
 *   type = "[Metatag]",
 *   parents = {"Entity"}
 *   secure = true
 * )
 */
class CustomEntityMetatags extends EntityMetatags {

}