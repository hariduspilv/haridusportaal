<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the xJson form entity entity.
 *
 * @see \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntity.
 */
class xJsonFormEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished xjson form entity entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published xjson form entity entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit xjson form entity entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete xjson form entity entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add xjson form entity entities');
  }

}
