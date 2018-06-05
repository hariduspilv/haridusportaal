<?php

namespace Drupal\custom_subscription_administration\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Subscription entity entities.
 *
 * @ingroup custom_subscription_administration
 */
interface SubscriptionEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

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
   * @return \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface
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
   * @return \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface
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
   * @return \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface
   *   The called Subscription entity entity.
   */
  public function setPublished($published);

  /**
   * Gets the Subscription entity revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the Subscription entity revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface
   *   The called Subscription entity entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the Subscription entity revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the Subscription entity revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\custom_subscription_administration\Entity\SubscriptionEntityInterface
   *   The called Subscription entity entity.
   */
  public function setRevisionUserId($uid);

}
