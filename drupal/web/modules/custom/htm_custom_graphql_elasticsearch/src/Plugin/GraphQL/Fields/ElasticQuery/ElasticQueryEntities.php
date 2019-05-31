<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery;

use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\graphql\Utility\StringHelper;
use GraphQL\Type\Definition\ResolveInfo;

/**
 *   @GraphQLField(
 *   secure = true,
 *   parents = {"CustomElasticQueryResult"},
 *   id = "custom_elastic_query_entities",
 *   name = "entities",
 *   type = "[CustomElastic]"
 * )
 */

class ElasticQueryEntities extends FieldPluginBase {

    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info)
    {
        foreach($value['values'] as $values){
            foreach($values['_source'] as $key => $keyvalue){
                if($key === 'field_teaching_language'){
                    $langterms = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->loadMultiple($keyvalue);
                    unset($keyvalue);
                    foreach($langterms as $term){
                        if($term){
                            $keyvalue[] = $term->label();
                        }
                    }
                }
                $values['_source'][StringHelper::camelCase($key)] = $keyvalue;
                unset($values['_source'][$key]);
            }
            yield $values['_source'];
        }
    }
}