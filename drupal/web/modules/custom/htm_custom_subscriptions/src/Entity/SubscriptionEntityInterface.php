<?php

namespace Drupal\htm_custom_subscriptions\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Subscription entity entities.
 *
 * @ingroup htm_custom_subscriptions
 */
interface SubscriptionEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Subscription entity name.
   *
   * @return string
   *   Name of the Subscription entity.
   */
  public function getName();

  /**
   * Sets the Subscription entity name.
   *
   * @param string $name
   *   The Subscription entity name.
   *
   * @return \Drupal\htm_custom_subscriptions\Entity\SubscriptionEntityInterface
   *   The called Subscription entity entity.
   */
  public function setName($name);

  /**
   * Gets the Subscription entity creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Subscription entity.
   */
  public function getCreatedTime();

  /**
   * Sets the Subscription entity creation timestamp.
   *
   * @param int $timestamp
   *   The Subscription entity creation timestamp.
   *
   * @return \Drupal\htm_custom_subscriptions\Entity\SubscriptionEntityInterface
   *   The called Subscription entity entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Subscription entity published status indicator.
   *
   * Unpublished Subscription entity are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Subscription entity is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Subscription entity.
   *
   * @param bool $published
   *   TRUE to set this Subscription entity to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_subscriptions\Entity\SubscriptionEntityInterface
   *   The called Subscription entity entity.
   */
  public function setPublished($published);

}
