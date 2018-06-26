<?php

namespace Drupal\graphql_custom_translation\Plugin\GraphQL\Fields;

use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Menu link descriptions.
 *
 * @GraphQLField(
 *   id = "custom_translation_description",
 *   secure = true,
 *   name = "description",
 *   type = "String",
 *   parents = {"MenuLink"}
 * )
 */
class MenuLinkDescription extends FieldPluginBase {

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if ($value instanceof MenuLinkTreeElement) {
			yield $value->link->getDescription();
		}
	}

}