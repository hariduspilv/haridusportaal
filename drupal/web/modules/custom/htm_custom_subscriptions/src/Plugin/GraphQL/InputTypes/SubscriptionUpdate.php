<?php

namespace Drupal\htm_custom_subscriptions\Plugin\GraphQL\InputTypes;

use Drupal\graphql\Plugin\GraphQL\InputTypes\InputTypePluginBase;
/**
 * The input type for article mutations.
 *
 * @GraphQLInputType(
 *   id = "subscription_update",
 *   name = "SubscriptionUpdate",
 *   fields = {
 *      "uuid" = "String!",
 *   }
 * )
 */
class SubscriptionUpdate extends InputTypePluginBase {
}
