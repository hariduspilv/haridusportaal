<?php

namespace Drupal\htm_custom_subscriptions\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;
/**
 * The input type for article mutations.
 *
 * @GraphQLInputType(
 *   id = "subscription_input",
 *   name = "SubscriptionInput",
 *   fields = {
 *      "newtags" = "String!",
 *      "email" = "Email!",
 *   }
 * )
 */
class SubscriptionInput extends InputTypePluginBase {
}
