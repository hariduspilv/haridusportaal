<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieve a Drupal menu's description.
 *
 * @GraphQLField(
 *   secure = true,
 *   parents = {"CustomElastic"},
 *   id = "custom_elasticquery_output",
 *	 deriver = "Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Derivers\ElasticFieldDeriver"
 * )
 */
class QueryOutput extends FieldPluginBase {

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

        //$derivative['type'] = StringHelper::camelCase('field', $entityTypeId, $fieldName);

        $derivative_id = $this->getDerivativeId();
        // Not all documents have values for all fields so we need to check.
        if (isset($value[$derivative_id])) {
            // Checking if the value of this derivative is a list or single value so
            // we can parse accordingly.
            if (is_array($value[$derivative_id])) {
                yield implode(", ", $value[$derivative_id]);
            }
            else {
                yield $value[$derivative_id];
            }
        }
    }
}
