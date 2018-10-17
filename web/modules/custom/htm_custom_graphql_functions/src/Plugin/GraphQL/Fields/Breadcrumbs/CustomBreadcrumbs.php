<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Breadcrumbs;

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
 *   response_cache_contexts = {
 *     "languages:language_url",
 *     "languages:language_interface",
 *   },
 *   contextual_arguments = {"language"}
 * )
 */
class CustomBreadcrumbs extends Breadcrumbs {

}
