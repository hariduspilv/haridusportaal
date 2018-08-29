<?php

namespace Drupal\htm_custom_subsidy_projects;

use Drupal\Core\Entity\ContentEntityStorageInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface;

/**
 * Defines the storage handler class for Subsidy project entities.
 *
 * This extends the base storage class, adding required special handling for
 * Subsidy project entities.
 *
 * @ingroup htm_custom_subsidy_projects
 */
interface SubsidyProjectEntityStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of Subsidy project revision IDs for a specific Subsidy project.
   *
   * @param \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface $entity
   *   The Subsidy project entity.
   *
   * @return int[]
   *   Subsidy project revision IDs (in ascending order).
   */
  public function revisionIds(SubsidyProjectEntityInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as Subsidy project author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   Subsidy project revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface $entity
   *   The Subsidy project entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(SubsidyProjectEntityInterface $entity);

  /**
   * Unsets the language for all Subsidy project with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
