<?php

namespace Drupal\htm_custom_infograph\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "infograph_filter_input",
 *   name = "InfographFilterInput",
 *   fields = {
 *     "graph_type" = "String!",
 *     "secondary_graph_type" = "String",
 *     "graph_group_by" = "String",
 *     "graph_v_axis" = "String",
 *     "indicator" = "[String]",
 *     "secondary_graph_indicator" = "[String]",
 *     "file" = "String!",
 *     "teema" = "[String]",
 *     "aasta" = "[String]",
 *     "silt" = "[String]"
 *   }
 * )
 */
class InfographFilterInput extends InputTypePluginBase {

}
