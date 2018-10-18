<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Oska table entity entity.
 *
 * @see \Drupal\htm_custom_oska\Entity\OskaTableEntity.
 */
class OskaTableEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\htm_custom_oska\Entity\OskaTableEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished oska table entity entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published oska table entity entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit oska table entity entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete oska table entity entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add oska table entity entities');
  }

}
