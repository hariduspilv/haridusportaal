<?php

namespace Drupal\htm_custom_infograph\Plugin\GraphQL\Fields\InfographQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 *
 *
 * @GraphQLField(
 *   secure = true,
 *   parents = {"Infograph"},
 *   id = "infograph_output",
 *	 deriver = "Drupal\htm_custom_infograph\Plugin\GraphQL\Derivers\InfographFieldDeriver"
 * )
 */
class InfographQueryOutput extends FieldPluginBase {

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
