<?php

namespace Drupal\htm_custom_graphql_functions\Plugin\GraphQL\Fields\Entity;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * @GraphQLField(
 *   id = "custom_oska_graph_data",
 *   secure = true,
 *   name = "oskaGraphData",
 *   type = "String",
 *   parents = {"Entity"},
 * )
 */
class OskaGraphData extends FieldPluginBase {

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

        foreach($value->getFieldDefinitions() as $key => $field){
            if($field->getType() === 'oska_graph_field'){
                $graph_field = $key;
            }
        }

        $value->__get($graph_field)->__get('value');

    }

}
