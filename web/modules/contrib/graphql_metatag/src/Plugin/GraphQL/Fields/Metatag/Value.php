<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\Metatag;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   secure = true,
 *   id = "metatag_value",
 *   name = "value",
 *   type = "String",
 *   parents = {"Metatag"}
 * )
 */
class Value extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if (isset($value['#tag']) && $value['#tag'] === 'meta') {
      yield $value['#attributes']['content'];
    }
    else if (isset($value['#tag']) && $value['#tag'] === 'link') {
      yield $value['#attributes']['href'];
    }
  }

}
