<?php

namespace Drupal\htm_custom_contribution_projects\Entity;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\RevisionLogInterface;
use Drupal\Core\Entity\EntityChangedInterface;
use Drupal\user\EntityOwnerInterface;

/**
 * Provides an interface for defining Contribution project entities.
 *
 * @ingroup htm_custom_contribution_projects
 */
interface ContributionProjectEntityInterface extends ContentEntityInterface, RevisionLogInterface, EntityChangedInterface, EntityOwnerInterface {

  // Add get/set methods for your configuration properties here.

  /**
   * Gets the Contribution project name.
   *
   * @return string
   *   Name of the Contribution project.
   */
  public function getName();

  /**
   * Sets the Contribution project name.
   *
   * @param string $name
   *   The Contribution project name.
   *
   * @return \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface
   *   The called Contribution project entity.
   */
  public function setName($name);

  /**
   * Gets the Contribution project creation timestamp.
   *
   * @return int
   *   Creation timestamp of the Contribution project.
   */
  public function getCreatedTime();

  /**
   * Sets the Contribution project creation timestamp.
   *
   * @param int $timestamp
   *   The Contribution project creation timestamp.
   *
   * @return \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface
   *   The called Contribution project entity.
   */
  public function setCreatedTime($timestamp);

  /**
   * Returns the Contribution project published status indicator.
   *
   * Unpublished Contribution project are only visible to restricted users.
   *
   * @return bool
   *   TRUE if the Contribution project is published.
   */
  public function isPublished();

  /**
   * Sets the published status of a Contribution project.
   *
   * @param bool $published
   *   TRUE to set this Contribution project to published, FALSE to set it to unpublished.
   *
   * @return \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface
   *   The called Contribution project entity.
   */
  public function setPublished($published);

  /**
   * Gets the Contribution project revision creation timestamp.
   *
   * @return int
   *   The UNIX timestamp of when this revision was created.
   */
  public function getRevisionCreationTime();

  /**
   * Sets the Contribution project revision creation timestamp.
   *
   * @param int $timestamp
   *   The UNIX timestamp of when this revision was created.
   *
   * @return \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface
   *   The called Contribution project entity.
   */
  public function setRevisionCreationTime($timestamp);

  /**
   * Gets the Contribution project revision author.
   *
   * @return \Drupal\user\UserInterface
   *   The user entity for the revision author.
   */
  public function getRevisionUser();

  /**
   * Sets the Contribution project revision author.
   *
   * @param int $uid
   *   The user ID of the revision author.
   *
   * @return \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntityInterface
   *   The called Contribution project entity.
   */
  public function setRevisionUserId($uid);

}
