<?php

namespace Drupal\content_sync\Plugin\SyncNormalizerDecorator;


use Drupal\content_sync\Plugin\SyncNormalizerDecoratorBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 *
 * @SyncNormalizerDecorator(
 *   id = "parents",
 *   name = @Translation("Parents"),
 * )
 */
class Parents extends SyncNormalizerDecoratorBase implements ContainerFactoryPluginInterface {


  protected $entityTypeManager;

  public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityTypeManagerInterface $entity_type_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @param array $configuration
   * @param $plugin_id
   * @param $plugin_definition
   *
   * @return static
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager')
    );
  }

  /**
   * @param array $normalized_entity
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   * @param $format
   * @param array $context
   */
  public function decorateNormalization(array &$normalized_entity, ContentEntityInterface $entity, $format, array $context = []) {
    if ($entity->hasField('parent')) {
      $entity_type = $entity->getEntityTypeId();
      $storage = $this->entityTypeManager->getStorage($entity_type);
      if (method_exists($storage, 'loadParents')) {
        $parents = $storage->loadParents($entity->id());
        foreach ($parents as $parent_key => $parent) {
          $normalized_entity['parent'][] = ['target_type' => $entity_type, 'target_uuid' => $parent->uuid()];
          $normalized_entity['_content_sync']['entity_dependencies'][$entity_type][] =  $entity_type . "." . $parent->bundle() . "." . $parent->uuid();
        }
      }elseif (method_exists($entity, 'getParentId')) {
        $parent = $entity->getParentId();
        if (($tmp = strstr($parent, ':')) !== false) {
          $parent_uuid = substr($tmp, 1);
          $normalized_entity['parent'][] = ['target_type' => $entity_type, 'target_uuid' => $parent_uuid];
          $normalized_entity['_content_sync']['entity_dependencies'][$entity_type][] =  $entity_type . "." . $entity_type . "." . $parent_uuid;
        }
      }
    }
  }

}