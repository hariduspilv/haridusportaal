<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\schema_metatag\SchemaMetatagManager;
use GraphQL\Type\Definition\ResolveInfo;

/**
 * Graphql field to retrieve entity schema metatags.
 *
 * @GraphQLField(
 *   secure = true,
 *   id = "entity_schema_metatags",
 *   name = "entitySchemaMetatags",
 *   type = "String",
 *   description = @Translation("Loads schema.org defined metatags for the
 *   entity"), parents = {"Entity"}
 * )
 */
class EntitySchemaMetatags extends EntityMetatags {

  /**
   * {@inheritdoc}
   *
   * @throws \JsonException
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {

    if ($value instanceof ContentEntityInterface && $this->isModuleSchemaActive()) {
      $entity = $value;
      if ($entity->isNew()) {
        yield NULL;
      }
      else {
        $this->changeRouteContext($entity);

        $tags = $this->metatagManager->tagsFromEntityWithDefaults($entity);

        $tags = $this->replaceTokens($tags, $entity);

        $metatagContext = [
          'entity' => &$entity,
          'graphql_context' => $context,
        ];
        $this->moduleHandler->alter('metatags', $tags, $metatagContext);
        
        $elements = $this->metatagManager->generateElements($tags, $entity);

        $jsonLd = SchemaMetatagManager::parseJsonld(
          $elements['#attached']['html_head']
        );

        $this->revertRouteContext();

        yield (string) json_encode($jsonLd, JSON_THROW_ON_ERROR);
      }
    }
    else {
      yield t('The module schema_metatag is not installed.');
    }
  }

  /**
   * Check if module SCHEMA_METATAG_MODULE_NAME is active.
   *
   * @return bool
   *   Is module schema active.
   */
  private function isModuleSchemaActive(): bool {
    return $this->moduleHandler->moduleExists(SCHEMA_METATAG_MODULE_NAME);
  }

  /**
   * Tells it is necessary to change the routing.
   *
   * For breadcrumbs is always necessary.
   *
   * @return bool
   *   True if it is necessary to change the routing system.
   */
  protected function routingNeedsToBeChanged(): bool {
    return TRUE;
  }

}
