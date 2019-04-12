<?php

namespace Drupal\content_sync\Content;

/**
 * Provides a factory for creating content file storage objects.
 */
class ContentFileStorageFactory {

  /**
   * Returns a FileStorage object working with the active content directory.
   *
   * @return \Drupal\Core\Config\FileStorage FileStorage
   *
   * @deprecated in Drupal 8.0.x and will be removed before 9.0.0. Drupal core
   * no longer creates an active directory.
   */
  public static function getActive() {
    // Load the class from a different namespace.
    $class = "Drupal\\Core\\Config\\FileStorage";
    return new $class(content_sync_get_content_directory(CONFIG_ACTIVE_DIRECTORY));
  }

  /**
   * Returns a FileStorage object working with the sync content directory.
   *
   * @return \Drupal\Core\Config\FileStorage FileStorage
   */
  public static function getSync() {
    // Load the class from a different namespace.
    $class = "Drupal\\Core\\Config\\FileStorage";
    return new $class(content_sync_get_content_directory(CONFIG_SYNC_DIRECTORY));
  }
}
