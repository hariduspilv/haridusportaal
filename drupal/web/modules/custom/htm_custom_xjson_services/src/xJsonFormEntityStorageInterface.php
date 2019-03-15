<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Core\Entity\ContentEntityStorageInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface;

/**
 * Defines the storage handler class for xJson form entity entities.
 *
 * This extends the base storage class, adding required special handling for
 * xJson form entity entities.
 *
 * @ingroup htm_custom_xjson_services
 */
interface xJsonFormEntityStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of xJson form entity revision IDs for a specific xJson form entity.
   *
   * @param \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface $entity
   *   The xJson form entity entity.
   *
   * @return int[]
   *   xJson form entity revision IDs (in ascending order).
   */
  public function revisionIds(xJsonFormEntityInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as xJson form entity author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   xJson form entity revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface $entity
   *   The xJson form entity entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(xJsonFormEntityInterface $entity);

  /**
   * Unsets the language for all xJson form entity with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
