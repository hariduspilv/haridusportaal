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
 *   type = "MapArray",
 *   parents = {"Metatag"}
 * )
 */
class Value extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if (isset($value['#tag'])) {
      if ($value['#tag'] === 'meta') {
        yield $value['#attributes']['content'];
      }
      elseif ($value['#tag'] === 'link') {
        if (isset($value['#attributes']['hreflang']) && $this->isModuleExternalHreflangActive()) {
          yield $value['#attributes'];
        }
        else {
          yield $value['#attributes']['href'];
        }
      }
    }
  }

  /**
   * Chec if module EXTERNAL_HREFLANG_MODULE_NAME is active.
   *
   * @return bool
   */
  private function isModuleExternalHreflangActive(): bool {
    return \Drupal::moduleHandler()->moduleExists(EXTERNAL_HREFLANG_MODULE_NAME);
  }

}
