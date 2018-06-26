<?php

namespace Drupal\graphql_custom_translation\Plugin\GraphQL\Fields;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\system\MenuInterface;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieve a Drupal menu's description.
 *
 * @GraphQLField(
 *   id = "test_field_output",
 *   secure = true,
 *   name = "description",
 *   type = "[String]",
 *   parents = {"CustomTrans"}
 * )
 */
class testFieldOutput extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		foreach($value as $index => $item){
			yield $item;
		}

	}

}
