<?php

namespace Drupal\htm_custom_contribution_projects;

use Drupal\Core\Entity\ContentEntityStorageInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface;

/**
 * Defines the storage handler class for Contribution project entities.
 *
 * This extends the base storage class, adding required special handling for
 * Contribution project entities.
 *
 * @ingroup htm_custom_contribution_projects
 */
interface ContributionProjectEntityStorageInterface extends ContentEntityStorageInterface {

  /**
   * Gets a list of Contribution project revision IDs for a specific Contribution project.
   *
   * @param \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface $entity
   *   The Contribution project entity.
   *
   * @return int[]
   *   Contribution project revision IDs (in ascending order).
   */
  public function revisionIds(ContributionProjectEntityInterface $entity);

  /**
   * Gets a list of revision IDs having a given user as Contribution project author.
   *
   * @param \Drupal\Core\Session\AccountInterface $account
   *   The user entity.
   *
   * @return int[]
   *   Contribution project revision IDs (in ascending order).
   */
  public function userRevisionIds(AccountInterface $account);

  /**
   * Counts the number of revisions in the default language.
   *
   * @param \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface $entity
   *   The Contribution project entity.
   *
   * @return int
   *   The number of revisions in the default language.
   */
  public function countDefaultLanguageRevisions(ContributionProjectEntityInterface $entity);

  /**
   * Unsets the language for all Contribution project with the given language.
   *
   * @param \Drupal\Core\Language\LanguageInterface $language
   *   The language object.
   */
  public function clearRevisionsLanguage(LanguageInterface $language);

}
