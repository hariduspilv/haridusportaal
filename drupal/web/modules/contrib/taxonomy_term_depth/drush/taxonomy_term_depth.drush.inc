<?php

/**
 * @file
 * Drush integration for the taxonomy_term_depth module.
 */
use Drupal\Core\Database\Database;

/**
 * Implements hook_drush_command().
 */
function taxonomy_term_depth_drush_command() {
  $items = array();

  // Command term-depth-prepare-uninstall
  // prepares the module to be uninstalled.
  $items['term-depth-prepare-uninstall'] = array(
    'description' => "Prepare uninstalling taxonomy term depth. Remove fields and data.",
    'aliases' => array('tdpu'),
  );

  return $items;
}

/**
 * Prepare uninstall for taxonomy term depth.
 *
 * This enables to delete the field's data from taxonomy term depth so
 * uninstalling the module doesn't fail.
 * @see https://www.drupal.org/node/2418659
 */
function drush_taxonomy_term_depth_term_depth_prepare_uninstall() {

  $connection = Database::getConnection();
  if ($connection->query("SELECT COUNT(*) FROM taxonomy_term_field_data WHERE depth_level <> NULL")->fetchField()) {
    $execute = \Drupal::database()
                      ->update('taxonomy_term_field_data')
                      ->fields(['depth_level' => NULL])
                      ->execute();

    if ($execute) {
      return drush_print(dt('All taxonomy term\'s depth field data Deleted. you can now uninstall the module: taxonomy_term_depth'));
    }
  }
  else {
    return drush_print(dt('There is no taxonomy term\'s depth field data to Delete. you can now uninstall the module: taxonomy_term_depth'));
  }
}
