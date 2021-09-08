<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Retrieve the count of an entity query.
 *
 * @GraphQLField(
 *   id = "custom_elastic_query_count",
 *   secure = true,
 *   name = "count",
 *   type = "Int",
 *   parents = {"CustomElasticQueryResult", "CustomElastic"}
 * )
 */
class ElasticQueryCount extends FieldPluginBase {

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

        yield (int) $value['count']['value'];
    }

}
