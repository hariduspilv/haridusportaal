<?php

namespace Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\Fields\ElasticQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\system\MenuInterface;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieve a Drupal menu's description.
 *
 * @GraphQLField(
 *   id = "custom_elasticquery_output",
 *   secure = true,
 *   name = "JSONValue",
 *   type = "[String]",
 *   parents = {"CustomElastic"}
 * )
 */
class QueryOutput extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

		yield $value['_source']['lon'][0];
		//yield $value['_source']['lat'][0];
	}

}
