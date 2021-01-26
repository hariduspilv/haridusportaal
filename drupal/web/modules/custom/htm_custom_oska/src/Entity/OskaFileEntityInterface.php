<?php

namespace Drupal\htm_custom_oska\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Oska entity entities.
 *
 * @ingroup htm_custom_oska
 */
interface OskaFileEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Oska entity name.
   *
   * @return string
   *   Name of the Oska entity.
   */
  public function getName();

  /**
   * Sets the Oska entity name.
   *
   * @param string $name
   *   The Oska entity name.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaFileEntityInterface
   *   The called Oska entity entity.
   */
  public function setName($name);

  /**
   * Gets the Oska entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Oska entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Oska entity creation timestamp.
   *
   * @param int $timestamp
   *   The Oska entity creation timestamp.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaFileEntityInterface
   *   The called Oska entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Oska entity published status indicator.
   *
   * Unpublished Oska entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Oska entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Oska entity.
   *
   * @param bool $published
   *   TRUE to set this Oska entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaFileEntityInterface
   *   The called Oska entity entity.
   */
  public function setPublished($published);

}
