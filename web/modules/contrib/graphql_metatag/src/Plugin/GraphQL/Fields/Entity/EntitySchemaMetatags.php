<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\schema_metatag\SchemaMetatagManager;
use GraphQL\Type\Definition\ResolveInfo;

/**
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
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if ($value instanceof ContentEntityInterface && $this->isModuleSchemaActive()) {
      $tags = $this->metatagManager->tagsFromEntityWithDefaults($value);

      // Trigger hook_metatags_attachments_alter().
      // Allow modules to rendered metatags prior to attaching.
      $this->moduleHandler->alter('metatags_attachments', $tags);

      $elements = $this->metatagManager->generateElements($tags, $value);
      $jsonLd = SchemaMetatagManager::parseJsonld($elements['#attached']['html_head']);
      yield (string) json_encode($jsonLd);
    }
    else {
      yield t('The module schema_metatag is not installed.');
    }
  }

  /**
   * Chec if module SCHEMA_METATAG_MODULE_NAME is active.
   *
   * @return bool
   */
  private function isModuleSchemaActive(): bool {
    return $this->moduleHandler->moduleExists(SCHEMA_METATAG_MODULE_NAME);
  }

}
