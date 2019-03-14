<?php

namespace Drupal\htm_custom_xjson_services\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining X json form entity entities.
 *
 * @ingroup htm_custom_xjson_services
 */
interface xJsonFormEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the X json form entity name.
   *
   * @return string
   *   Name of the X json form entity.
   */
  public function getName();

  /**
   * Sets the X json form entity name.
   *
   * @param string $name
   *   The X json form entity name.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called X json form entity entity.
   */
  public function setName($name);

  /**
   * Gets the X json form entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the X json form entity.
   */
  public function getCreatedTime();

  /**
   * Sets the X json form entity creation timestamp.
   *
   * @param int $timestamp
   *   The X json form entity creation timestamp.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called X json form entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the X json form entity published status indicator.
   *
   * Unpublished X json form entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the X json form entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a X json form entity.
   *
   * @param bool $published
   *   TRUE to set this X json form entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called X json form entity entity.
   */
  public function setPublished($published);

  /**
   * Gets the X json form entity revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the X json form entity revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called X json form entity entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the X json form entity revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the X json form entity revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\htm_custom_xjson_services\Entity\xJsonFormEntityInterface
   *   The called X json form entity entity.
   */
  public function setRevisionUserId($uid);

}
