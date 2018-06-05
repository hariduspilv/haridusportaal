<?php

namespace Drupal\custom_subscription_administration;

use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface;

/**
 * Defines the storage handler class for Subscription entity entities.
 *
 * This extends the base storage class, adding required special handling for
 * Subscription entity entities.
 *
 * @ingroup custom_subscription_administration
 */
class SubscriptionEntityStorage extends SqlContentEntityStorage implements SubscriptionEntityStorageInterface {

  /**
   * {@inheritdoc}
   */
  public function revisionIds(SubscriptionEntityInterface $entity) {
    return $this->database->query(
      'SELECT vid FROM {subscription_entity_revision} WHERE id=:id ORDER BY vid',
      [':id' => $entity->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function userRevisionIds(AccountInterface $account) {
    return $this->database->query(
      'SELECT vid FROM {subscription_entity_field_revision} WHERE uid = :uid ORDER BY vid',
      [':uid' => $account->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function countDefaultLanguageRevisions(SubscriptionEntityInterface $entity) {
    return $this->database->query('SELECT COUNT(*) FROM {subscription_entity_field_revision} WHERE id = :id AND default_langcode = 1', [':id' => $entity->id()])
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function clearRevisionsLanguage(LanguageInterface $language) {
    return $this->database->update('subscription_entity_revision')
      ->fields(['langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED])
      ->condition('langcode', $language->getId())
      ->execute();
  }

}
