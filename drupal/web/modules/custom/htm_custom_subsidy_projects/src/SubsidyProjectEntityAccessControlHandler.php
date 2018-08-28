<?php

namespace Drupal\htm_custom_subsidy_projects;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Subsidy project entity.
 *
 * @see \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntity.
 */
class SubsidyProjectEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished subsidy project entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published subsidy project entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit subsidy project entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete subsidy project entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add subsidy project entities');
  }

}
