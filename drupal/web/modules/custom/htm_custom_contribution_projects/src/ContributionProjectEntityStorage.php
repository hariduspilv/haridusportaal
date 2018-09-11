<?php

namespace Drupal\htm_custom_contribution_projects;

use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
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
class ContributionProjectEntityStorage extends SqlContentEntityStorage implements ContributionProjectEntityStorageInterface {

  /**
   * {@inheritdoc}
   */
  public function revisionIds(ContributionProjectEntityInterface $entity) {
    return $this->database->query(
      'SELECT vid FROM {contribution_project_entity_revision} WHERE id=:id ORDER BY vid',
      [':id' => $entity->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function userRevisionIds(AccountInterface $account) {
    return $this->database->query(
      'SELECT vid FROM {contribution_project_entity_field_revision} WHERE uid = :uid ORDER BY vid',
      [':uid' => $account->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function countDefaultLanguageRevisions(ContributionProjectEntityInterface $entity) {
    return $this->database->query('SELECT COUNT(*) FROM {contribution_project_entity_field_revision} WHERE id = :id AND default_langcode = 1', [':id' => $entity->id()])
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function clearRevisionsLanguage(LanguageInterface $language) {
    return $this->database->update('contribution_project_entity_revision')
      ->fields(['langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED])
      ->condition('langcode', $language->getId())
      ->execute();
  }

}
