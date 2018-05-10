<?php

/**
 * @file
 * Contains \Drupal\delete_all\Controller\EntityDeleteController.
 */

namespace Drupal\delete_all\Controller;

use Drupal\delete_all\Controller\DeleteControllerBase;

/**
 * Returns responses for devel module routes.
 */
class EntityDeleteController extends DeleteControllerBase {
    /**
     * Get ids of the entities to delete.
     *
     * @param string $entity_type
     *   entity machine name
     *
     * @param string $bundle_type
     *   entity machine name
     *
     * @param array $entity_info
     *   entity definition information
     *
     * @return array
     *   Array of ids of entities to delete.
     */
    public function getEntitiesToDelete($entity_type, $bundle_type = false, $entity_info) {
        $entities_to_delete = [];

        // Delete content by entity type.
        if ($entity_type !== FALSE) {


            $query = \Drupal::entityQuery($entity_type);

            if ($bundle_type)
                $query->condition($entity_info[$entity_type]['entity_bundle'], $bundle_type);

            $to_delete = $query->execute();
        }
        // Can't delete content of all entities
        else {
                $to_delete = [];
        }

        return $to_delete;
    }

    /**
     *
     */
    public function getEntitiesDeleteBatch($entities_to_delete = FALSE, $entity_type) {
        // Define batch.
        $batch = array(
            'operations' => array(
                array('delete_all_entities_batch_delete', array($entities_to_delete, $entity_type)),
            ),
            'finished' => 'delete_all_entities_batch_delete_finished',
            'title' => t('Deleting entities'),
            'init_message' => t('Entity deletion is starting.'),
            'progress_message' => t('Deleting entities...'),
            'error_message' => t('Entity deletion has encountered an error.'),
        );

        return $batch;
    }
}
