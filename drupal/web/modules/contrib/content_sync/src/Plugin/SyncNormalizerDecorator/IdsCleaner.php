<?php

namespace Drupal\content_sync\Plugin\SyncNormalizerDecorator;


use Drupal\content_sync\Plugin\SyncNormalizerDecoratorBase;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Provides a decorator for setting the alias to entity.
 *
 * @SyncNormalizerDecorator(
 *   id = "id_cleaner",
 *   name = @Translation("IDs Cleaner"),
 * )
 */
class IdsCleaner extends SyncNormalizerDecoratorBase {

  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * @param array $normalized_entity
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   * @param $format
   * @param array $context
   */
  public function decorateNormalization(array &$normalized_entity, ContentEntityInterface $entity, $format, array $context = []) {
    $this->cleanReferenceIds($normalized_entity, $entity);
    $this->cleanIds($normalized_entity, $entity);
  }

  /**
   * @param $normalized_entity
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *
   * @return mixed
   */
  protected function cleanReferenceIds(&$normalized_entity, ContentEntityInterface $entity) {
    $field_definitions = $entity->getFieldDefinitions();
    foreach ($field_definitions as $field_name => $field_definition) {
      // We are only interested in importing content entities.
      if (!is_a($field_definition->getClass(), '\Drupal\Core\Field\EntityReferenceFieldItemList', TRUE)) {
        continue;
      }
      if (isset($normalized_entity[$field_name]) && !empty($normalized_entity[$field_name]) && is_array($normalized_entity[$field_name])) {
        $entity_type = $field_definition->getFieldStorageDefinition()
                                        ->getSetting('target_type');
        $reflection = new \ReflectionClass(\Drupal::entityTypeManager()
                                                  ->getDefinition($entity_type)
                                                  ->getClass());
        if (!$reflection->implementsInterface('\Drupal\Core\Entity\ContentEntityInterface')) {
          continue;
        }
        $key = $field_definition->getFieldStorageDefinition()
                                ->getMainPropertyName();
        foreach ($normalized_entity[$field_name] as &$item) {
          if (!empty($item[$key])) {
            unset($item[$key]);
          }
          if (!empty($item['url'])) {
            unset($item['url']);
          }
        }
      }
    }
    return $normalized_entity;
  }


  /**
   * @param $normalized_entity
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *
   * @return mixed
   */
  protected function cleanIds(&$normalized_entity, ContentEntityInterface $entity) {
    $keys = $entity->getEntityType()->getKeys();
    if (isset($normalized_entity[$keys['id']])) {
      unset($normalized_entity[$keys['id']]);
    }
    if (isset($keys['revision']) && isset($normalized_entity[$keys['revision']])) {
      unset($normalized_entity[$keys['revision']]);
    }
    return $normalized_entity;
  }
}
