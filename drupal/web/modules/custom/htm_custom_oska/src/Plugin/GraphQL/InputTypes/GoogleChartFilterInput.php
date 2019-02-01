<?php

namespace Drupal\htm_custom_oska\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "google_chart_filter_input",
 *   name = "GoogleChartFilterInput",
 *   fields = {
 *     "graph_set" = "String!",
 *     "graph_type" = "String!",
 *     "secondary_graph_type" = "String",
 *     "graph_group_by" = "String",
 *     "indicator" = "String",
 *     "secondary_graph_indicator" = "String",
 *     "valdkond" = "[String]",
 *     "alavaldkond" = "[String]",
 *     "ametiala" = "[String]",
 *     "periood" = "[String]",
 *     "silt" = "[String]"
 *   }
 * )
 */
class GoogleChartFilterInput extends InputTypePluginBase {

}
