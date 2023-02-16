<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Scalars\TypedData;

use Drupal\graphql\Plugin\GraphQL\Scalars\ScalarPluginBase;

/**
 * MapArray.
 *
 * @GraphQLScalar(
 *   id = "map_array",
 *   name = "MapArray",
 *   type = "map"
 * )
 */
class MapArray extends ScalarPluginBase {

  /**
   * {@inheritdoc}
   */
  public static function serialize($value) {
    if (is_array($value)) {
      return $value;
    }

    if (is_string($value)) {
      return $value;
    }

    return '';
  }

}
