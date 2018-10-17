<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Metatag;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_metatag_value",
 *   name = "value",
 *   type = "String",
 *   parents = {"Metatag"},
 *   secure = true
 * )
 */
class Value extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if (isset($value['#tag']) && $value['#tag'] === 'meta') {
			yield $value['#attributes']['content'];
		}
		else if (isset($value['#tag']) && $value['#tag'] === 'link') {
			yield $value['#attributes']['href'];
		}
	}

}
