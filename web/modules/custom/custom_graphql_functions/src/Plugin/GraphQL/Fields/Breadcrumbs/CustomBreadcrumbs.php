<?php

namespace Drupal\custom_graphql_functions\Plugin\GraphQL\Fields\Breadcrumbs;

use Drupal\graphql_core\Plugin\GraphQL\Fields\Breadcrumbs\Breadcrumbs;

/**
 * Retrieve the breadcrumbs.
 *
 * @GraphQLField(
 *   id = "custom_breadcrumb",
 *   secure = true,
 *   name = "breadcrumb",
 *   type = "[Link]",
 *   parents = {"InternalUrl"},
 * )
 */
class CustomBreadcrumbs extends Breadcrumbs {

	protected function isLanguageAwareField()
	{
		return TRUE;
	}
}
