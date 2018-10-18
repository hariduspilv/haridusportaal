<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Metatag;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_metatag\Plugin\GraphQL\Fields\Metatag\Key;
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
class CustomKey extends Key {

	/**
	 * {@inheritdoc}
	 */
	protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if (isset($value['#tag']) && $value['#tag'] === 'meta') {
			if(isset($value['#attributes']['property'])) yield $value['#attributes']['property'];
			if(isset($value['#attributes']['name'])) yield $value['#attributes']['name'];
			if(isset($value['#attributes']['http-equiv'])) yield $value['#attributes']['http-equiv'];
		}
		else if (isset($value['#tag']) && $value['#tag'] === 'link') {
			yield $value['#attributes']['rel'];
		}
	}

}
