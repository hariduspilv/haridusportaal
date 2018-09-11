<?php

/**
 * @file
 * Drush integration file.
 */

/**
 * Implements hook_drush_sql_sync_sanitize().
 */
function purge_queuer_url_drush_sql_sync_sanitize($source) {

  // Bootstrap drupal otherwise container will not be available.
  drush_bootstrap(DRUSH_BOOTSTRAP_DRUPAL_FULL);

  // Clear the traffic registry.
  \Drupal::service('purge_queuer_url.registry')->clear();
}
