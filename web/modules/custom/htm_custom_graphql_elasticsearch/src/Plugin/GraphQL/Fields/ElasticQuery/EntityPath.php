<?php

namespace Drupal\htm_custom_graphql_elasticsearch\Plugin\GraphQL\Fields\ElasticQuery;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;
use Drupal\Core\Link;

/**
 * Retrieve a link text.
 *
 * @GraphQLField(
 *   id = "custom_entity_path_decoded",
 *   secure = true,
 *   name = "EntityPath",
 *   description = @Translation("The path of an entity."),
 *   type = "String",
 *   parents = {"CustomElastic"},
 *   response_cache_contexts = {
 *     "languages:language_url",
 *     "languages:language_interface"
 *   },
 *   contextual_arguments = {"language"}
 * )
 */
class EntityPath extends FieldPluginBase {

    /**
     * {@inheritdoc}
     */
    public function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
        foreach($value['EntityPath'] as $url){
            yield urldecode($url);
        }
    }

}
