<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the xJson entity entity.
 *
 * @see \Drupal\htm_custom_xjson_services\Entity\xJsonEntity.
 */
class xJsonEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished xjson entity entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published xjson entity entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit xjson entity entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete xjson entity entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add xjson entity entities');
  }

}
