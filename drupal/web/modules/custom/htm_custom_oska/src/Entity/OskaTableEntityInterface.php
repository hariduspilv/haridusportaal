<?php

namespace Drupal\htm_custom_oska\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Oska table entity entities.
 *
 * @ingroup htm_custom_oska
 */
interface OskaTableEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Oska table entity name.
   *
   * @return string
   *   Name of the Oska table entity.
   */
  public function getName();

  /**
   * Sets the Oska table entity name.
   *
   * @param string $name
   *   The Oska table entity name.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaTableEntityInterface
   *   The called Oska table entity entity.
   */
  public function setName($name);

  /**
   * Gets the Oska table entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Oska table entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Oska table entity creation timestamp.
   *
   * @param int $timestamp
   *   The Oska table entity creation timestamp.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaTableEntityInterface
   *   The called Oska table entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Oska table entity published status indicator.
   *
   * Unpublished Oska table entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Oska table entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Oska table entity.
   *
   * @param bool $published
   *   TRUE to set this Oska table entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaTableEntityInterface
   *   The called Oska table entity entity.
   */
  public function setPublished($published);

}
