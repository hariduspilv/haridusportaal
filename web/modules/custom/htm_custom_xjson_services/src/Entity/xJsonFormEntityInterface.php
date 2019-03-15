<?php

namespace Drupal\htm_custom_xjson_services\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining xJson form entity entities.
 *
 * @ingroup htm_custom_xjson_services
 */
interface xJsonFormEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the xJson form entity name.
   *
   * @return string
   *   Name of the xJson form entity.
   */
  public function getName();

  /**
   * Sets the xJson form entity name.
   *
   * @param string $name
   *   The xJson form entity name.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called xJson form entity entity.
   */
  public function setName($name);

  /**
   * Gets the xJson form entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the xJson form entity.
   */
  public function getCreatedTime();

  /**
   * Sets the xJson form entity creation timestamp.
   *
   * @param int $timestamp
   *   The xJson form entity creation timestamp.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called xJson form entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the xJson form entity published status indicator.
   *
   * Unpublished xJson form entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the xJson form entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a xJson form entity.
   *
   * @param bool $published
   *   TRUE to set this xJson form entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called xJson form entity entity.
   */
  public function setPublished($published);

  /**
   * Gets the xJson form entity revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the xJson form entity revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called xJson form entity entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the xJson form entity revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the xJson form entity revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called xJson form entity entity.
   */
  public function setRevisionUserId($uid);

}
