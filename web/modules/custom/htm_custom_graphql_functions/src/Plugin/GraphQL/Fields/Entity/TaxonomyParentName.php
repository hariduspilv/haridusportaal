<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Entity;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_taxonomy_parentname",
 *   secure = true,
 *   name = "parentName",
 *   type = "String",
 *   parents = {"Entity"},
 * )
 */
 class TaxonomyParentName extends FieldPluginBase {

 	/**
 	 * {@inheritdoc}
 	 */
 	public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

    $terms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadParents($value->id());

    foreach($terms as $term){
      yield $term->getName();
    }

 	}

 }
