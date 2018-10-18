<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Metatag;


use Drupal\graphql_metatag\Plugin\GraphQL\Fields\Metatag\Value;

/**
 * @GraphQLField(
 *   id = "metatag_value",
 *   name = "value",
 *   type = "String",
 *   parents = {"Metatag"},
 *   secure = true
 * )
 */
class CustomValue extends Value {

}
