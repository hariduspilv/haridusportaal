<?php

namespace Drupal\htm_custom_xjson_services\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining xJson entity entities.
 *
 * @ingroup htm_custom_xjson_services
 */
interface xJsonEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the xJson entity name.
   *
   * @return string
   *   Name of the xJson entity.
   */
  public function getName();

  /**
   * Sets the xJson entity name.
   *
   * @param string $name
   *   The xJson entity name.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface
   *   The called xJson entity entity.
   */
  public function setName($name);

  /**
   * Gets the xJson entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the xJson entity.
   */
  public function getCreatedTime();

  /**
   * Sets the xJson entity creation timestamp.
   *
   * @param int $timestamp
   *   The xJson entity creation timestamp.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface
   *   The called xJson entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the xJson entity published status indicator.
   *
   * Unpublished xJson entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the xJson entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a xJson entity.
   *
   * @param bool $published
   *   TRUE to set this xJson entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface
   *   The called xJson entity entity.
   */
  public function setPublished($published);

  /**
   * Gets the xJson entity revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the xJson entity revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface
   *   The called xJson entity entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the xJson entity revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the xJson entity revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonEntityInterface
   *   The called xJson entity entity.
   */
  public function setRevisionUserId($uid);

}
