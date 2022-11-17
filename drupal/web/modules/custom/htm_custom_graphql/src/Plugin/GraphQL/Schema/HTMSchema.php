<?php

namespace Drupal\htm_custom_graphql\Plugin\GraphQL\Schema;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\Plugin\GraphQL\Schema\SdlSchemaPluginBase;
use Drupal\graphql_examples\Wrappers\QueryConnection;
use Drupal\node\NodeInterface;
use GraphQL\Error\Error;

/**
 * @Schema(
 *   id = "htmschema",
 *   name = "HTM schema"
 * )
 */
class HTMSchema extends SdlSchemaPluginBase {

  /**
   * {@inheritdoc}
   */
  public function getResolverRegistry() {
  $builder = new ResolverBuilder();
  $registry = new ResolverRegistry();

  $this->addQueryFields($registry, $builder);
  $this->addArticleFields($registry, $builder);
  $this->addYouthMonitoringFields($registry,$builder);
    $registry->addTypeResolver('NodeInterface', function ($value) {
      if ($value instanceof NodeInterface) {
        switch ($value->bundle()) {
          case 'article': return 'Article';
          case 'page': return 'Page';
        }
      }
      throw new Error('Could not resolve content type.');
    });


  $this->addParagraphFields($registry, $builder);
  // Re-usable connection type fields.
  $this->addConnectionFields('ArticleConnection', $registry, $builder);

  return $registry;
}




  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addArticleFields(ResolverRegistry $registry, ResolverBuilder $builder): void {

  $registry->addFieldResolver('Article', 'nid',
    $builder->produce('entity_id')
      ->map('entity', $builder->fromParent())
  );
  $registry->addFieldResolver('Article', 'title',
    $builder->compose(
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent()),
      $builder->produce('uppercase')
        ->map('string', $builder->fromParent())
    )
  );

    $registry->addFieldResolver('Article', 'fieldAccordionSection',
      $builder->compose(
      $builder->produce('entity_reference')
        ->map('entity', $builder->fromParent())
        ->map('language', $builder->fromArgument('lang'))
        ->map('field', $builder->fromValue('field_accordion_section')),
    )
    );


  $registry->addFieldResolver('Article', 'author',
    $builder->compose(
      $builder->produce('entity_owner')
        ->map('entity', $builder->fromParent()),
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent())
    )
  );
  $registry->addFieldResolver('Article','fieldBody',
  $builder->produce('entity_id')
    ->map('entity',$builder->fromParent())
  );
    $registry->addFieldResolver('Article', 'fieldVideo',
      $builder->compose(
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:node'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_video')),
        $builder->callback(function ($entity) {
          $list = [];
          foreach($entity as $item){
            array_push($list, $item);
          }
          return $list;
        })
      )
    );



}
  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addParagraphFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('AccordionSection', 'id',
      $builder->compose(
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
      )
    );
    $registry->addFieldResolver('AccordionSection', 'field_accordion_title',
      $builder->produce('field')
        ->map('entity', $builder->fromParent())
        ->map('lang',$builder->fromArgument('lang'))
        ->map('field_value',$builder->fromValue('value'))
        ->map('field',$builder->fromValue('field_accordion_title'))
    );
    $registry->addFieldResolver('AccordionSection', 'field_body',
      $builder->produce('field_text')
        ->map('entity',$builder->fromParent())
      ->map('field',$builder->fromValue('field_body'))
    );
    $registry->addFieldResolver('AccordionSection', 'field_related_article',
      $builder->compose(
        $builder->produce('property_path')
          ->map('type', $builder->fromValue('entity:node'))
          ->map('value', $builder->fromParent())
          ->map('path', $builder->fromValue('field_related_article')),
        $builder->callback(function ($entity) {
          $list = [];

          foreach($entity as $item){
            array_push($list, $item);
          }
          return $list;
        })
      )
    );
//    $registry->addFieldResolver('AccordionSection', 'field_related_article',
//      $builder->compose(
//      $builder->produce('field_link')
//      ->map('entity',$builder->fromParent())
//      ->map('field',$builder->fromValue('field_related_article')),
//      $builder->callback(function ($entity) {
//        $list = [];
//        \Drupal::logger('graphql')->notice('<pre><code>PARAMS: ' . print_r($entity, TRUE) . '</code></pre>' );
//
//        foreach($entity as $item){
//          array_push($list, $item);
//        }
//        return $list;
//      })
//      )
//    );
  }
  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addYouthMonitoringFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
  $registry->addFieldResolver('YouthMonitoringFields', 'id',
    $builder->produce('entity_id')
      ->map('entity', $builder->fromParent())
  );

  $registry->addFieldResolver('YouthMonitoringFields', 'title',
    $builder->compose(
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent()),
      $builder->produce('uppercase')
        ->map('string', $builder->fromParent())
    )
  );

  $registry->addFieldResolver('YouthMonitoringFields', 'author',
    $builder->compose(
      $builder->produce('entity_owner')
        ->map('entity', $builder->fromParent()),
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent())
    )
  );
}

  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addQueryFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
  $registry->addFieldResolver('Query', 'article',
    $builder->compose(
    $builder->produce('entity_load')
      ->map('type', $builder->fromValue('node'))
      ->map('bundles', $builder->fromValue(['article']))
      ->map('id', $builder->fromArgument('id')),
    $builder->produce('entity_translation')
    ->map('entity',$builder->fromParent())
    ->map('language',$builder->fromArgument('lang'))
    )
  );
    $registry->addFieldResolver('Query', 'route', $builder->compose(
      $builder->produce('route_load')
        ->map('path', $builder->fromArgument('path')),
      $builder->produce('route_entity')
        ->map('url', $builder->fromParent())
        ->map('language', $builder->fromArgument('lang'))
    ));
  $registry->addFieldResolver('Query', 'youthmonitoringfields',
    $builder->produce('entity_load')
      ->map('type', $builder->fromValue('node'))
      ->map('bundles', $builder->fromValue(['youth_monitoring_page']))
      ->map('id', $builder->fromArgument('id'))
  );

  $registry->addFieldResolver('Query', 'articles',
    $builder->produce('query_articles')
      ->map('offset', $builder->fromArgument('offset'))
      ->map('limit', $builder->fromArgument('limit'))
  );
}

  /**
   * @param string $type
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addConnectionFields($type, ResolverRegistry $registry, ResolverBuilder $builder): void {
  $registry->addFieldResolver($type, 'total',
    $builder->callback(function (QueryConnection $connection) {
      return $connection->total();
    })
  );

  $registry->addFieldResolver($type, 'items',
    $builder->callback(function (QueryConnection $connection) {
      return $connection->items();
    })
  );
}

}
