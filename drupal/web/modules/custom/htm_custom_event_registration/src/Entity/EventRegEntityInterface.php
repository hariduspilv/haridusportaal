<?php

namespace Drupal\htm_custom_event_registration\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Event registration entities.
 *
 * @ingroup htm_custom_event_registration
 */
interface EventRegEntityInterface extends ContentEntityInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Event registration name.
   *
   * @return string
   *   Name of the Event registration.
   */
  public function getName();

  /**
   * Sets the Event registration name.
   *
   * @param string $name
   *   The Event registration name.
   *
   * @return \Drupal\htm_custom_event_registration\Entity\EventRegEntityInterface
   *   The called Event registration entity.
   */
  public function setName($name);

  /**
   * Gets the Event registration creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Event registration.
   */
  public function getCreatedTime();

  /**
   * Sets the Event registration creation timestamp.
   *
   * @param int $timestamp
   *   The Event registration creation timestamp.
   *
   * @return \Drupal\htm_custom_event_registration\Entity\EventRegEntityInterface
   *   The called Event registration entity.
   */
  public function setCreatedTime($timestamp);

	/**
	 * Gets the Event registration change timestamp.
	 *
	 * @return int
	 *   Creation timestamp of the Event registration.
	 */
	public function getChangedTime();

	/**
	 * Sets the Event registration change timestamp.
	 *
	 * @param int $timestamp
	 *   The Event registration change timestamp.
	 *
	 * @return \Drupal\htm_custom_event_registration\Entity\EventRegEntityInterface
	 *   The called Event registration entity.
	 */
	public function setChangedTime($timestamp);

  /**
   * Returns the Event registration published status indicator.
   *
   * Unpublished Event registration are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Event registration is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Event registration.
   *
   * @param bool $published
   *   TRUE to set this Event registration to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_event_registration\Entity\EventRegEntityInterface
   *   The called Event registration entity.
   */
  public function setPublished($published);

}
