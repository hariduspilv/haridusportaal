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
 *     "page_id" = "Int"
 *   }
 * )
 */
class FavoriteInput extends InputTypePluginBase {
}