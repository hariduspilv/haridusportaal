<?php

namespace Drupal\content_sync\Plugin;

use Drupal\Component\Plugin\PluginInspectionInterface;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Defines an interface for Sync normalizer decorator plugins.
 */
interface SyncNormalizerDecoratorInterface extends PluginInspectionInterface {

  /**
   * Apply decoration for the normalization process.
   */
  public function decorateNormalization(array &$normalized_entity, ContentEntityInterface $entity, $format, array $context = []);

  /**
   * Apply decoration for the denormalization process.
   */
  public function decorateDenormalization(array &$normalized_entity, $type, $format, array $context = []);


  /**
   * Apply decoration to the entity after the denormalization process is done.
   */
  public function decorateDenormalizedEntity(ContentEntityInterface $entity, array $normalized_entity, $format, array $context = []);

}
