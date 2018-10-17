<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Events;


use Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\EntityQuery\EntityQuery;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_event_dates",
 *   secure = true,
 *   type = "EntityQueryResult!",
 *   name = "eventsQuery",
 *   arguments = {
 *     "filter" = "EntityQueryFilterInput",
 *     "sort" = "[EntityQuerySortInput]",
 *     "offset" = {
 *       "type" = "Int",
 *       "default" = 0
 *     },
 *     "limit" = "Int",
 *     "revisions" = {
 *       "type" = "EntityQueryRevisionMode",
 *       "default" = "default"
 *     },
 *     "node_filter" = "EntityQueryFilterInput",
 *   },
 * )
 */
class EventsQuery extends EntityQuery {

	/**
	 * Create the basic entity query for the plugin's entity type.
	 *
	 * @param mixed $value
	 *   The parent entity type.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Drupal\Core\Entity\Query\QueryInterface
	 *   The entity query object.
	 */
	protected function getBaseQuery($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$entityType = $this->getEntityType($value, $args, $context, $info);
		$entityStorage = $this->entityTypeManager->getStorage($entityType);
		$query = $entityStorage->getQuery();
		$query->accessCheck(TRUE);

		// The context object can e.g. transport the parent entity language.
		$query->addMetaData('graphql_context', $this->getQueryContext($value, $args, $context, $info));

		//add filtered nodes in context
		$context->setContext('nodes', $this->getNodeQuery($value, $args, $context, $info)->execute(), $info);

		return $query;
	}

	/**
	 * Retrieve the target entity type of this plugin.
	 *
	 * @param mixed $value
	 *   The parent value.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return null|string
	 *   The entity type object or NULL if none could be derived.
	 */
	protected function getEntityType($value, array $args, ResolveContext $context, ResolveInfo $info) {
		return 'paragraph';
	}

	/**
	 * Create the basic entity query for the plugin's entity type.
	 *
	 * @param mixed $value
	 *   The parent entity type.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Drupal\Core\Entity\Query\QueryInterface
	 *   The entity query object.
	 */
	protected function getNodeBaseQuery($value, array $args, ResolveContext $context, ResolveInfo $info){
		$entityStorage = $this->entityTypeManager->getStorage('node');
		$query = $entityStorage->getQuery();
		$query->accessCheck(TRUE);
		$query->condition('type', 'event');

		// The context object can e.g. transport the parent entity language.
		$query->addMetaData('graphql_context', $this->getQueryContext($value, $args, $context, $info));

		return $query;
	}

	/**
	 * Create the full entity query for the plugin's entity type.
	 *
	 * @param mixed $value
	 *   The parent entity type.
	 * @param array $args
	 *   The field arguments array.
	 * @param \Drupal\graphql\GraphQL\Execution\ResolveContext $context
	 *   The resolve context.
	 * @param \GraphQL\Type\Definition\ResolveInfo $info
	 *   The resolve info object.
	 *
	 * @return \Drupal\Core\Entity\Query\QueryInterface
	 *   The entity query object.
	 */
	protected function getNodeQuery($value, array $args, ResolveContext $context, ResolveInfo $info) {
		$query = $this->getNodeBaseQuery($value, $args, $context, $info);

		if(array_key_exists('node_filter', $args)){
			$query = $this->applyFilter($query, $args['node_filter']);
		}


		return $query;
	}

}

