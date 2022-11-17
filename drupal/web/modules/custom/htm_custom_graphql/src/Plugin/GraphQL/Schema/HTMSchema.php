<?php

namespace Drupal\htm_custom_graphql\Plugin\GraphQL\Schema;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\Plugin\GraphQL\Schema\SdlSchemaPluginBase;
use Drupal\graphql_examples\Wrappers\QueryConnection;

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

  // Re-usable connection type fields.
  $this->addConnectionFields('ArticleConnection', $registry, $builder);

  return $registry;
}




  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addArticleFields(ResolverRegistry $registry, ResolverBuilder $builder): void {

  $registry->addFieldResolver('Article', 'id',
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

    $registry->addFieldResolver('Article', 'field_accordion_section',
      $builder->produce('entity_reference')
        ->map('entity', $builder->fromParent())
        ->map('field', $builder->fromValue('field_accordion_section'))
    );

    $this->addParagraphFields($registry, $builder);

  $registry->addFieldResolver('Article', 'author',
    $builder->compose(
      $builder->produce('entity_owner')
        ->map('entity', $builder->fromParent()),
      $builder->produce('entity_label')
        ->map('entity', $builder->fromParent())
    )
  );
  $registry->addFieldResolver('Text','value',
    $builder->produce('field_text')
    ->map('entity',$builder->fromParent())
    ->map('field',$builder->fromValue('field_body'))
  );
}
  /**
   * @param \Drupal\graphql\GraphQL\ResolverRegistry $registry
   * @param \Drupal\graphql\GraphQL\ResolverBuilder $builder
   */
  protected function addParagraphFields(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $registry->addFieldResolver('AccordionSection', 'id',
      $builder->produce('entity_id')
        ->map('entity', $builder->fromParent())
    );
    $registry->addFieldResolver('AccordionSection', 'field_accordion_title',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path',$builder->fromValue('field_accordion_title.value'))
    );
    $registry->addFieldResolver('AccordionSection', 'field_body',
      $builder->produce('property_path')
        ->map('type', $builder->fromValue('entity:paragraph'))
        ->map('value', $builder->fromParent())
        ->map('path',$builder->fromValue('field_body.value'))
    );
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
    $builder->produce('entity_load')
      ->map('type', $builder->fromValue('node'))
      ->map('bundles', $builder->fromValue(['article']))
      ->map('id', $builder->fromArgument('id'))
  );
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
