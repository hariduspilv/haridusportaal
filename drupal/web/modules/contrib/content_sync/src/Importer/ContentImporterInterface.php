<?php

namespace Drupal\content_sync\Importer;


interface ContentImporterInterface {

  /**
   * @param $decoded_entity
   * @param $entity_type_id
   * @param array $context
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface
   */
  public function importEntity($decoded_entity, $context = []);

}