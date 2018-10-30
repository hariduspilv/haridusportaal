<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Menu;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Menu\MenuLinkInterface;
use Drupal\Core\Menu\MenuLinkTreeElement;
use Drupal\Core\Menu\MenuTreeParameters;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql_core\Plugin\GraphQL\Fields\Menu\MenuLinks;
use Drupal\system\MenuInterface;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieves a menus links.
 *
 * @GraphQLField(
 *   id = "menu_links",
 *   secure = true,
 *   name = "links",
 *   type = "[MenuLink]",
 *   parents = {"Menu"},
 *   response_cache_contexts = {"languages:language_url"}
 * )
 */
class CustomMenuLinks extends MenuLinks{
	use DependencySerializationTrait;

	/**
	 * {@inheritdoc}
	 */
	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
		if ($value instanceof MenuInterface) {
			$tree = $this->menuLinkTree->load($value->id(), new MenuTreeParameters());
			$manipulators = [
					['callable' => 'menu.default_tree_manipulators:checkAccess'],
					['callable' => 'menu.default_tree_manipulators:checkNodeAccess'],
					['callable' => 'htm_custom_graphql_functions.custom_tree_manipulators:checkAccess'],
					['callable' => 'htm_custom_graphql_functions.custom_tree_manipulators:OverrideLinks'],
					['callable' => 'menu.default_tree_manipulators:generateIndexAndSort']
			];

			foreach (array_filter($this->menuLinkTree->transform($tree, $manipulators), function (MenuLinkTreeElement $item) {
				return $item->link instanceof MenuLinkInterface && $item->link->isEnabled();
			}) as $branch) {
				yield $branch;
			}
		}

	}

}
