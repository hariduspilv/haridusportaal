<?php

namespace Drupal\htm_custom_favorites\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Favorite entities.
 *
 * @ingroup htm_custom_favorites
 */
interface FavoriteEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Favorite name.
   *
   * @return string
   *   Name of the Favorite.
   */
  public function getName();

  /**
   * Sets the Favorite name.
   *
   * @param string $name
   *   The Favorite name.
   *
   * @return \Drupal\htm_custom_favorites\Entity\FavoriteEntityInterface
   *   The called Favorite entity.
   */
  public function setName($name);

  /**
   * Gets the Favorite creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Favorite.
   */
  public function getCreatedTime();

  /**
   * Sets the Favorite creation timestamp.
   *
   * @param int $timestamp
   *   The Favorite creation timestamp.
   *
   * @return \Drupal\htm_custom_favorites\Entity\FavoriteEntityInterface
   *   The called Favorite entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Favorite published status indicator.
   *
   * Unpublished Favorite are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Favorite is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Favorite.
   *
   * @param bool $published
   *   TRUE to set this Favorite to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_favorites\Entity\FavoriteEntityInterface
   *   The called Favorite entity.
   */
  public function setPublished($published);

}
