<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\Metatag;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   secure = true,
 *   id = "metatag_key",
 *   name = "key",
 *   type = "String",
 *   parents = {"Metatag"}
 * )
 */
class Key extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if (isset($value['#tag'])) {
      if ($value['#tag'] === 'meta') {
        if (isset($value['#attributes']['property'])) {
          yield $value['#attributes']['property'];
        }
        elseif (isset($value['#attributes']['http-equiv'])) {
          yield $value['#attributes']['http-equiv'];
        }
        elseif (isset($value['#attributes']['itemprop'])) {
          yield $value['#attributes']['itemprop'];
        }
        elseif (isset($value['#attributes']['name'])) {
          yield $value['#attributes']['name'];
        }
        else {
          yield '';
        }
      }
      elseif ($value['#tag'] === 'link') {
        yield $value['#attributes']['rel'];
      }
    }
  }
}
