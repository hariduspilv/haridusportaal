<?php

namespace Drupal\custom_graphql_taxonomy_query\Plugin\GraphQL\Fields\TaxonomyQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieve a Drupal menu's description.
 *
 * @GraphQLField(
 *   secure = true,
 *   parents = {"CustomTaxonomy"},
 *   id = "custom_taxonomy_query_output",
 *	 deriver = "Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\Derivers\ElasticFieldDeriver"
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
