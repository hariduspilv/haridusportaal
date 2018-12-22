<?php

namespace Drupal\content_sync\Plugin;

use Drupal\Core\Entity\ContentEntityInterface;

trait SyncNormalizerDecoratorTrait {

  protected function decorateNormalization(array &$normalized_entity, ContentEntityInterface $entity, $format, array $context = []) {
    $plugins = $this->getDecoratorManager()->getDefinitions();
    foreach ($plugins as $decorator) {
      /* @var $instance SyncNormalizerDecoratorInterface */
      $instance = $this->getDecoratorManager()->createInstance($decorator['id']);
      $instance->decorateNormalization($normalized_entity, $entity, $format, $context);
    }
  }

  protected function decorateDenormalization(array &$normalized_entity, $type, $format, array $context = []) {
    $plugins = $this->getDecoratorManager()->getDefinitions();
    foreach ($plugins as $decorator) {
      /* @var $instance SyncNormalizerDecoratorInterface */
      $instance = $this->getDecoratorManager()->createInstance($decorator['id']);
      $instance->decorateDenormalization($normalized_entity, $type, $format, $context);
    }
  }

  protected function decorateDenormalizedEntity(ContentEntityInterface $entity, array $normalized_entity, $format, array $context = []) {
    $plugins = $this->getDecoratorManager()->getDefinitions();
    foreach ($plugins as $decorator) {
      /* @var $instance SyncNormalizerDecoratorInterface */
      $instance = $this->getDecoratorManager()->createInstance($decorator['id']);
      $instance->decorateDenormalizedEntity($entity, $normalized_entity, $format, $context);
    }
  }

  /**
   * @return SyncNormalizerDecoratorManager
   */
  protected abstract function getDecoratorManager();

}