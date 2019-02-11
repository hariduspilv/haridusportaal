<?php

namespace Drupal\htm_custom_oska\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Oska filling bar entity entities.
 *
 * @ingroup htm_custom_oska
 */
interface OskaFillingBarEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Oska filling bar entity name.
   *
   * @return string
   *   Name of the Oska filling bar entity.
   */
  public function getName();

  /**
   * Sets the Oska filling bar entity name.
   *
   * @param string $name
   *   The Oska filling bar entity name.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaFillingBarEntityInterface
   *   The called Oska filling bar entity entity.
   */
  public function setName($name);

  /**
   * Gets the Oska filling bar entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Oska filling bar entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Oska filling bar entity creation timestamp.
   *
   * @param int $timestamp
   *   The Oska filling bar entity creation timestamp.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaFillingBarEntityInterface
   *   The called Oska filling bar entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Oska filling bar entity published status indicator.
   *
   * Unpublished Oska filling bar entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Oska filling bar entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Oska filling bar entity.
   *
   * @param bool $published
   *   TRUE to set this Oska filling bar entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaFillingBarEntityInterface
   *   The called Oska filling bar entity entity.
   */
  public function setPublished($published);

}
