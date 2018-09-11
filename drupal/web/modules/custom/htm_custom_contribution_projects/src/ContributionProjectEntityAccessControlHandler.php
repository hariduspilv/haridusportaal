<?php

namespace Drupal\htm_custom_contribution_projects;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Contribution project entity.
 *
 * @see \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntity.
 */
class ContributionProjectEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished contribution project entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published contribution project entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit contribution project entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete contribution project entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add contribution project entities');
  }

}
