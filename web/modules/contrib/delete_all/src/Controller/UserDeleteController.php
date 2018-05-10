<?php

/**
 * @file
 * Contains \Drupal\delete_all\Controller\UserDeleteController.
 */

namespace Drupal\delete_all\Controller;

use Drupal\delete_all\Controller\DeleteControllerBase;

/**
 * Returns responses for devel module routes.
 */
class UserDeleteController extends DeleteControllerBase {

  /**
   * Get uids of the users to delete.
   *
   * @param array $roles
   *   Array of roles.
   *
   * @return array
   *   Array of uids of users to delete.
   */
  public function getUserToDelete($roles = FALSE) {
    $users_to_delete = array();

    // Get the uids of users to delete by role.
    if ($roles !== FALSE) {
      foreach ($roles as $role) {
        if (isset($role) && !empty($role)) {
          $uids = $this->connection->select('user__roles', 'ur')
                    ->fields('ur', array('entity_id'))
                    ->condition('roles_target_id', $role)
                    ->execute()
                    ->fetchCol('uid');

          $users_to_delete = array_merge($users_to_delete, $uids);

          // Exclude anonymous users and root.
          $users_to_delete = array_diff($users_to_delete, array(0, 1));
        }
      }
    }
    // Delete all users if roles are not provided.
    else {
      $users_to_delete = FALSE;
    }

    return $users_to_delete;
  }

  /**
   *
   */
  public function getUserDeleteBatch($users_to_delete = FALSE) {
    // Define batch.
    $batch = array(
      'operations' => array(
        array('delete_all_users_batch_delete', array($users_to_delete)),
      ),
      'finished' => 'delete_all_users_batch_delete_finished',
      'title' => t('Deleting users'),
      'init_message' => t('User deletion is starting.'),
      'progress_message' => t('Deleting users...'),
      'error_message' => t('User deletion has encountered an error.'),
    );

    return $batch;
  }
}


