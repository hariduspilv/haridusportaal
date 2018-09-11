<?php

namespace Drupal\htm_custom_subsidy_projects;

use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
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
class SubsidyProjectEntityStorage extends SqlContentEntityStorage implements SubsidyProjectEntityStorageInterface {

  /**
   * {@inheritdoc}
   */
  public function revisionIds(SubsidyProjectEntityInterface $entity) {
    return $this->database->query(
      'SELECT vid FROM {subsidy_project_entity_revision} WHERE id=:id ORDER BY vid',
      [':id' => $entity->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function userRevisionIds(AccountInterface $account) {
    return $this->database->query(
      'SELECT vid FROM {subsidy_project_entity_field_revision} WHERE uid = :uid ORDER BY vid',
      [':uid' => $account->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function countDefaultLanguageRevisions(SubsidyProjectEntityInterface $entity) {
    return $this->database->query('SELECT COUNT(*) FROM {subsidy_project_entity_field_revision} WHERE id = :id AND default_langcode = 1', [':id' => $entity->id()])
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function clearRevisionsLanguage(LanguageInterface $language) {
    return $this->database->update('subsidy_project_entity_revision')
      ->fields(['langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED])
      ->condition('langcode', $language->getId())
      ->execute();
  }

}
