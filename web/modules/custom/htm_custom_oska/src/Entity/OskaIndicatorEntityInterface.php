<?php

namespace Drupal\htm_custom_oska\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Oska indicator entity entities.
 *
 * @ingroup htm_custom_oska
 */
interface OskaIndicatorEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Oska indicator entity name.
   *
   * @return string
   *   Name of the Oska indicator entity.
   */
  public function getName();

  /**
   * Sets the Oska indicator entity name.
   *
   * @param string $name
   *   The Oska indicator entity name.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaIndicatorEntityInterface
   *   The called Oska indicator entity entity.
   */
  public function setName($name);

  /**
   * Gets the Oska indicator entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Oska indicator entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Oska indicator entity creation timestamp.
   *
   * @param int $timestamp
   *   The Oska indicator entity creation timestamp.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaIndicatorEntityInterface
   *   The called Oska indicator entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Oska indicator entity published status indicator.
   *
   * Unpublished Oska indicator entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Oska indicator entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Oska indicator entity.
   *
   * @param bool $published
   *   TRUE to set this Oska indicator entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_oska\Entity\OskaIndicatorEntityInterface
   *   The called Oska indicator entity entity.
   */
  public function setPublished($published);

}
