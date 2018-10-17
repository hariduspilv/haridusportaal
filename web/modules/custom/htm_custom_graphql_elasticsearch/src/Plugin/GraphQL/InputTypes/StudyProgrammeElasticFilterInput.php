<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "custom_study_programme_elasticsearch_filter_input",
 *   name = "CustomStudyProgrammeElasticFilterInput",
 *   fields = {
 *     "nid" = "Int!",
 *     "school_address" = "String"
 *   }
 * )
 */
class StudyProgrammeElasticFilterInput extends InputTypePluginBase {

}
