<?php

namespace Drupal\content_sync\Exporter;


use Drupal\Core\Entity\ContentEntityInterface;

interface ContentExporterInterface {

  /**
   * Exports the given entity.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   * @param array $context
   *
   * @return array
   */
  public function exportEntity(ContentEntityInterface $entity, array $context = []);
}