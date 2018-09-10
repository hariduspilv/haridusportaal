<?php

namespace Drupal\htm_custom_favorites\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Favorite entity entities.
 *
 * @ingroup htm_custom_favorites
 */
interface FavoriteEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Favorite entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Favorite entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Favorite entity creation timestamp.
   *
   * @param int $timestamp
   *   The Favorite entity creation timestamp.
   *
   * @return \Drupal\htm_custom_favorites\Entity\FavoriteEntityInterface
   *   The called Favorite entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Favorite entity published status indicator.
   *
   * Unpublished Favorite entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Favorite entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Favorite entity.
   *
   * @param bool $published
   *   TRUE to set this Favorite entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_favorites\Entity\FavoriteEntityInterface
   *   The called Favorite entity entity.
   */
  public function setPublished($published);

}
