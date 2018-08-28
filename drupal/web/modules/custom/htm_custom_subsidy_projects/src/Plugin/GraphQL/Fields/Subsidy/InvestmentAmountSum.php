<?php

namespace Drupal\htm_custom_subsidy_projects\Plugin\GraphQL\Fields\Subsidy;

use Drupal\Core\Entity\EntityInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "investment_amount_sum",
 *   secure = true,
 *   name = "investmentAmountSum",
 *   type = "Int",
 *   parents = {"CustomSubsidy"}
 * )
 */
class investmentAmountSum extends FieldPluginBase {

  /**
   * {@inheritdoc}
   */
  public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    yield $value;
  }

}
