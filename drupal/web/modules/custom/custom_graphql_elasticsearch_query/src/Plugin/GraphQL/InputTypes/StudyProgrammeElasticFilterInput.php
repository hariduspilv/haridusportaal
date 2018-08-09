<?php

namespace Drupal\custom_graphql_elasticsearch_query\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;

/**
 * @GraphQLInputType(
 *   id = "custom_study_programme_elasticsearch_filter_input",
 *   name = "CustomStudyProgrammeElasticFilterInput",
 *   fields = {
 *     "nid" = "Int!"
 *   }
 * )
 */
class StudyProgrammeElasticFilterInput extends InputTypePluginBase {

}
