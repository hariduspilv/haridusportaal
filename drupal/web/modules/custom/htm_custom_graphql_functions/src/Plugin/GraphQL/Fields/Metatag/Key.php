<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Metatag;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_metatag_key",
 *   name = "key",
 *   type = "String",
 *   parents = {"Metatag"},
 *   secure = true
 * )
 */
class Key extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if (isset($value['#tag']) && $value['#tag'] === 'meta') {
			if(isset($value['#attributes']['property'])) yield $value['#attributes']['property'];
			if(isset($value['#attributes']['name'])) yield $value['#attributes']['name'];
			if(isset($value['#attributes']['http-equiv'])) yield $value['#attributes']['http-equiv'];
			//yield isset($value['#attributes']['property']) ? $value['#attributes']['property'] : $value['#attributes']['name'];
		}
		else if (isset($value['#tag']) && $value['#tag'] === 'link') {
			yield $value['#attributes']['rel'];
		}
	}

}
