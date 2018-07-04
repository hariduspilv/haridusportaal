<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Core\Entity\ContentEntityStorageInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface;

/**
 * Defines the storage handler class for xJson entity entities.
 *
 * This extends the base storage class, adding required special handling for
 * xJson entity entities.
 *
 * @ingroup htm_custom_xjson_services
 */
interface xJsonEntityStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of xJson entity revision IDs for a specific xJson entity.
   *
   * @param \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface $entity
   *   The xJson entity entity.
   *
   * @return int[]
   *   xJson entity revision IDs (in ascending order).
   */
  public function revisionIds(xJsonEntityInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as xJson entity author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   xJson entity revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface $entity
   *   The xJson entity entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(xJsonEntityInterface $entity);

  /**
   * Unsets the language for all xJson entity with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
