<?php

namespace Drupal\htm_custom_graphql_tags\Plugin\GraphQL\Fields\TagsQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieve a Drupal menu's description.
 *
 * @GraphQLField(
 *   id = "custom_query_output",
 *   secure = true,
 *   name = "description",
 *   type = "[String]",
 *   parents = {"CustomTags"}
 * )
 */
class QueryOutput extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		foreach($value as $index => $item){
			yield $item;
		}

	}

}
