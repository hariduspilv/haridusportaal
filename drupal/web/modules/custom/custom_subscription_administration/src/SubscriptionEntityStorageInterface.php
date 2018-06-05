<?php

namespace Drupal\custom_subscription_administration;

use Drupal\Core\Entity\ContentEntityStorageInterface;
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
interface SubscriptionEntityStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of Subscription entity revision IDs for a specific Subscription entity.
   *
   * @param \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface $entity
   *   The Subscription entity entity.
   *
   * @return int[]
   *   Subscription entity revision IDs (in ascending order).
   */
  public function revisionIds(SubscriptionEntityInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as Subscription entity author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   Subscription entity revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface $entity
   *   The Subscription entity entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(SubscriptionEntityInterface $entity);

  /**
   * Unsets the language for all Subscription entity with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
