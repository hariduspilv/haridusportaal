<?php

namespace Drupal\content_sync\Plugin;

use Drupal\Component\Plugin\PluginBase;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Base class for Sync normalizer decorator plugins.
 */
abstract class SyncNormalizerDecoratorBase extends PluginBase implements SyncNormalizerDecoratorInterface {

  /**
   * {@inheritdoc}
   */
  public function decorateNormalization(array &$normalized_entity, ContentEntityInterface $entity, $format, array $context = []) {

  }

  /**
   * {@inheritdoc}
   */
  public function decorateDenormalization(array &$normalized_entity, $type, $format, array $context = []) {

  }

  /**
   * {@inheritdoc}
   */
  public function decorateDenormalizedEntity(ContentEntityInterface $entity, array $normalized_entity, $format, array $context = []) {

  }
}
