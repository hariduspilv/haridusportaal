<?php

namespace Drupal\search_api\Entity;

use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Core\Entity\Sql\SqlContentEntityStorageSchema;

/**
 * Defines a storage schema for task entities.
 */
class TaskStorageSchema extends SqlContentEntityStorageSchema {

  /**
   * {@inheritdoc}
   */
  protected function getEntitySchema(ContentEntityTypeInterface $entity_type, $reset = FALSE): array {
    $schema = parent::getEntitySchema($entity_type, $reset);

    if ($data_table = $this->storage->getBaseTable()) {
      $data = 'data';
      // MySQL cannot handle UNIQUE indices on TEXT/BLOB fields without a prefix
      // length.
      if ($this->database->driver() === 'mysql') {
        $data = ['data', 255];
      }
      $schema[$data_table]['unique keys'] += [
        'task__unique' => ['type', 'server_id', 'index_id', $data],
      ];
    }

    return $schema;
  }

}
