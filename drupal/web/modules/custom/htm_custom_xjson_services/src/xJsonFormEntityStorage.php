<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Core\Entity\Sql\SqlContentEntityStorage;
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
class xJsonFormEntityStorage extends SqlContentEntityStorage implements xJsonFormEntityStorageInterface {

  /**
   * {@inheritdoc}
   */
  public function revisionIds(xJsonFormEntityInterface $entity) {
    return $this->database->query(
      'SELECT vid FROM {x_json_form_entity_revision} WHERE id=:id ORDER BY vid',
      [':id' => $entity->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function userRevisionIds(AccountInterface $account) {
    return $this->database->query(
      'SELECT vid FROM {x_json_form_entity_field_revision} WHERE uid = :uid ORDER BY vid',
      [':uid' => $account->id()]
    )->fetchCol();
  }

  /**
   * {@inheritdoc}
   */
  public function countDefaultLanguageRevisions(xJsonFormEntityInterface $entity) {
    return $this->database->query('SELECT COUNT(*) FROM {x_json_form_entity_field_revision} WHERE id = :id AND default_langcode = 1', [':id' => $entity->id()])
      ->fetchField();
  }

  /**
   * {@inheritdoc}
   */
  public function clearRevisionsLanguage(LanguageInterface $language) {
    return $this->database->update('x_json_form_entity_revision')
      ->fields(['langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED])
      ->condition('langcode', $language->getId())
      ->execute();
  }

}
