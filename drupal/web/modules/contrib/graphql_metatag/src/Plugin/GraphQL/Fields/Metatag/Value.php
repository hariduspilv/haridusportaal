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
        if (isset($value['#attributes']['hreflang']) && $this->isModuleHreflangActive()) {
          yield $value['#attributes'];
        }
        else {
          yield $value['#attributes']['href'];
        }
      }
    }
  }

  /**
   * Check if module hreflang module is active.
   *
   * @return bool
   *   Returns true if any hreflang modules is active.
   */
  private function isModuleHreflangActive(): bool {
    return $this->isModuleExternalHreflangActive() || $this->isModuleMetatagHreflangActive();
  }

  /**
   * Check if module EXTERNAL_HREFLANG_MODULE_NAME is active.
   *
   * @return bool
   *   Returns true if EXTERNAL_HREFLANG_MODULE_NAME is active.
   */
  private function isModuleExternalHreflangActive(): bool {
    return \Drupal::moduleHandler()
      ->moduleExists(EXTERNAL_HREFLANG_MODULE_NAME);
  }

  /**
   * Check if module METATAG_HREFLANG_MODULE_NAME is active.
   *
   * @return bool
   *   Returns true if METATAG_HREFLANG_MODULE_NAME is active.
   */
  private function isModuleMetatagHreflangActive(): bool {
    return \Drupal::moduleHandler()->moduleExists(METATAG_HREFLANG_MODULE_NAME);
  }

}

