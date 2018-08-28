<?php

namespace Drupal\htm_custom_subsidy_projects\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Subsidy project entities.
 *
 * @ingroup htm_custom_subsidy_projects
 */
interface SubsidyProjectEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Subsidy project name.
   *
   * @return string
   *   Name of the Subsidy project.
   */
  public function getName();

  /**
   * Sets the Subsidy project name.
   *
   * @param string $name
   *   The Subsidy project name.
   *
   * @return \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface
   *   The called Subsidy project entity.
   */
  public function setName($name);

  /**
   * Gets the Subsidy project creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Subsidy project.
   */
  public function getCreatedTime();

  /**
   * Sets the Subsidy project creation timestamp.
   *
   * @param int $timestamp
   *   The Subsidy project creation timestamp.
   *
   * @return \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface
   *   The called Subsidy project entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Subsidy project published status indicator.
   *
   * Unpublished Subsidy project are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Subsidy project is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Subsidy project.
   *
   * @param bool $published
   *   TRUE to set this Subsidy project to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface
   *   The called Subsidy project entity.
   */
  public function setPublished($published);

  /**
   * Gets the Subsidy project revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the Subsidy project revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface
   *   The called Subsidy project entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the Subsidy project revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the Subsidy project revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntityInterface
   *   The called Subsidy project entity.
   */
  public function setRevisionUserId($uid);

}
