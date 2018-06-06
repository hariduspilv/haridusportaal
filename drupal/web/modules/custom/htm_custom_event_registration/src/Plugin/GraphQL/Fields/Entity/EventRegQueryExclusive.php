<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\Fields\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Fields\EntityQuery\EntityQuery;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Query entities of the same type without the context's entity.
 *
 * @GraphQLField(
 *   id = "event_reg_query_exclusive",
 *   name = "eventRegQueryExclusive",
 *   secure = true,
 *   type = "EntityQueryResult!",
 *   parents = {"Entity"},
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
 *     },
 *     "bundles" = {
 *       "type" = "EntityQueryBundleMode",
 *       "default" = "same"
 *     }
 *   }
 * )
 */
class EventRegQueryExclusive extends EntityQuery {

	/**
	 * {@inheritdoc}
	 */
	protected function getBaseQuery($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if ($value instanceof ContentEntityInterface) {
			$query = \Drupal::entityQuery('event_reg_entity');
			$query->accessCheck(TRUE);

			// The context object can e.g. transport the parent entity language.
			$query->addMetaData('graphql_context', $this->getQueryContext($value, $args, $context, $info));
			$query->condition('event_reference', $value->get('nid')->value, '=');

			return $query;
		}

	}
}
