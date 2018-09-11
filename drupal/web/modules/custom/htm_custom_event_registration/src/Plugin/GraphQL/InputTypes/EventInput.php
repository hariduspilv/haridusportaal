<?php

namespace Drupal\htm_custom_event_registration\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;
/**
 * The input type for article mutations.
 *
 * @GraphQLInputType(
 *   id = "article_input",
 *   name = "EventInput",
 *   fields = {
 *      "event_id" = "Int!",
 *      "id_code" = "Int",
 *      "first_name" = "String!",
 *      "last_name" = "String!",
 *      "organization" = "String",
 *      "email" = "Email!",
 *      "phone" = "String",
 *      "comment" = "String"
 *   }
 * )
 */
class EventInput extends InputTypePluginBase {
}