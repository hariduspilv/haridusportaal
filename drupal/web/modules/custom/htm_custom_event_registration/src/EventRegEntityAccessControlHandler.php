<?php

namespace Drupal\htm_custom_event_registration;

use Drupal\Core\Entity\EntityAccessControlHandler;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;

/**
 * Access controller for the Event registration entity.
 *
 * @see \Drupal\htm_custom_event_registration\Entity\EventRegEntity.
 */
class EventRegEntityAccessControlHandler extends EntityAccessControlHandler {

  /**
   * {@inheritdoc}
   */
  protected function checkAccess(EntityInterface $entity, $operation, AccountInterface $account) {
    /** @var \Drupal\htm_custom_event_registration\Entity\EventRegEntityInterface $entity */
    switch ($operation) {
      case 'view':
        if (!$entity->isPublished()) {
          return AccessResult::allowedIfHasPermission($account, 'view unpublished event registration entities');
        }
        return AccessResult::allowedIfHasPermission($account, 'view published event registration entities');

      case 'update':
        return AccessResult::allowedIfHasPermission($account, 'edit event registration entities');

      case 'delete':
        return AccessResult::allowedIfHasPermission($account, 'delete event registration entities');
    }

    // Unknown operation, no opinion.
    return AccessResult::neutral();
  }

  /**
   * {@inheritdoc}
   */
  protected function checkCreateAccess(AccountInterface $account, array $context, $entity_bundle = NULL) {
    return AccessResult::allowedIfHasPermission($account, 'add event registration entities');
  }

}
