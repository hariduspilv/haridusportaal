<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Types;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Types\TypePluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLType(
 *   id = "meta_link_hreflang",
 *   name = "MetaLinkHreflang",
 *   interfaces = {"Metatag"}
 * )
 */
class MetaHreflang extends TypePluginBase {

  /**
   * {@inheritdoc}
   */
  public function applies($object, ResolveContext $context, ResolveInfo $info = NULL) {
    return isset($object['#tag'], $object['#attributes']['hreflang']) && $object['#tag'] === 'link';
  }

}
