<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\InputTypes\EntityQuery;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "entity_query_sort_input",
 *   name = "EntityQuerySortInput",
 *   fields = {
 *     "field" = "String!",
 *     "language" = "LanguageId",
 *     "direction" = {
 *       "type" = "SortOrder",
 *       "default" = "DESC"
 *     }
 *   }
 * )
 */
class EntityQuerySortInput extends InputTypePluginBase {

}
