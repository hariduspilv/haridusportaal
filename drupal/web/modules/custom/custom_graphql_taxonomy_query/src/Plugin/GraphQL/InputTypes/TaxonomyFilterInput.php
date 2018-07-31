<?php

namespace Drupal\custom_graphql_taxonomy_query\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "custom_taxonomy_filter_input",
 *   name = "CustomTaxonomyFilterInput",
 *   fields = {
 *     "type" = "String!"
 *   }
 * )
 */
class TaxonomyFilterInput extends InputTypePluginBase {

}
