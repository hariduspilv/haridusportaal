<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\EntityQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "entity_query",
 *   secure = true,
 *   type = "EntityQueryResult",
 *   arguments = {
 *     "filter" = "EntityQueryFilterInput",
 *     "sort" = "[EntityQuerySortInput]",
 *     "offset" = {
 *       "type" = "Int",
 *       "default" = 0
 *     },
 *     "limit" = {
 *       "type" = "Int",
 *       "default" = 10
 *     },
 *     "revisions" = {
 *       "type" = "EntityQueryRevisionMode",
 *       "default" = "default"
 *     }
 *   },
 *   deriver = "Drupal\graphql_core\Plugin\Deriver\Fields\EntityQueryDeriver"
 * )
 */
class EntityQuery extends \Drupal\graphql_core\Plugin\GraphQL\Fields\EntityQuery\EntityQuery {
    protected function getQuery($value, array $args, ResolveContext $context, ResolveInfo $info)
    {
        if (!$query = $this->getBaseQuery($value, $args, $context, $info)) {
            return NULL;
        }
        if($args['limit'] > 0) $query->range($args['offset'], $args['limit']);

        if (array_key_exists('revisions', $args)) {
            $query = $this->applyRevisionsMode($query, $args['revisions']);
        }

        if (array_key_exists('filter', $args)) {
            $query = $this->applyFilter($query, $args['filter']);
        }

        if (array_key_exists('sort', $args)) {
            $query = $this->applySort($query, $args['sort']);
        }

        return $query;
    }


}
