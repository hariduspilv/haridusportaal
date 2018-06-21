<?php

namespace Drupal\htm_custom_favorites\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;
/**
 * The input type for article mutations.
 *
 * @GraphQLInputType(
 *   id = "favorite_input",
 *   name = "FavoriteInput",
 *   fields = {
 *   	 "favorite_title" = "String!",
 *     "page_id" = "Int",
 *   	 "type" = "String!",
 *   	 "search" = "String",
 *   }
 * )
 */
class FavoriteInput extends InputTypePluginBase {
}