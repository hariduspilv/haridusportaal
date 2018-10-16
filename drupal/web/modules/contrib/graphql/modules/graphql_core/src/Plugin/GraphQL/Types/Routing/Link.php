<?php

namespace Drupal\graphql_core\Plugin\GraphQL\Types\Routing;

use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;

/**
 * GraphQL type for link.
 *
 * @GraphQLType(
 *   id = "link",
 *   name = "Link",
 *   schema_cache_contexts = {"languages:language_url", "languages:language_interface"}
 * )
 */
class Link extends TypePluginBase {

}
