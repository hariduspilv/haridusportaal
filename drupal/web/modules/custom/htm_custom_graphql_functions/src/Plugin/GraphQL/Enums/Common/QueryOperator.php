<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Enums\Common;

use Drupal\graphql\Plugin\GraphQL\Enums\EnumPluginBase;

/**
 * @GraphQLEnum(
 *   id = "custom_query_operator",
 *   name = "QueryOperator",
 *   values = {
 *     "EQUAL" = "=",
 *     "NOT_EQUAL" = "<>",
 *     "SMALLER_THAN" = "<",
 *     "SMALLER_THAN_OR_EQUAL" = "<=",
 *     "GREATER_THAN" = ">",
 *     "GREATER_THAN_OR_EQUAL" = ">=",
 *     "IN" = "IN",
 *     "NOT_IN" = "NOT IN",
 *     "LIKE" = "LIKE",
 *     "NOT_LIKE" = "NOT LIKE",
 *     "BETWEEN" = "BETWEEN",
 *     "NOT_BETWEEN" = "NOT BETWEEN",
 *     "IS_NULL" = "IS NULL",
 *     "IS_NOT_NULL" = "IS NOT NULL",
 *     "FUZZY" = "FUZZY"
 *   }
 * )
 */
class QueryOperator extends EnumPluginBase {

}
