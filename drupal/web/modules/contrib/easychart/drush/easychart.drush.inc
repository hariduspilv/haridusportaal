<?php

/**
 * @file
 * Easychart drush functions.
 */

/**
 * Implements hook_drush_command().
 */
function easychart_drush_command() {
  $items = array();

  $items['easychart-dependencies'] = array(
    'aliases' => array('ec-dependencies'),
    'callback' => 'easychart_drush_dependencies',
    'description' => dt('Download and install the javascript dependencies for the Easychart module.'),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUPAL_FULL,
  );
  return $items;
}

/**
 * Implements hook_drush_help().
 */
function easychart_drush_help($section) {
  switch ($section) {
    case 'drush:easychart-plugin':
      return dt('Download and install the Highcharts javascript library and the Easychart plugin from github.com/daemth/easychart, location is in /libraries.');
  }
}

/**
 * Drush callback: download the easychart javascript dependencies.
 */
function easychart_drush_dependencies() {

  // Make sure easychart is enabled.
  if (!\Drupal::moduleHandler()->moduleExists('easychart')) {
    drush_log(dt('Please enable the Easychart module first.'), 'notice');
    return;
  }

  // Path variables.
  $libraries_path = 'libraries';

  // Store the old directory.
  $old_dir = getcwd();

  // Create the libraries folder if it does not exist.
  if (!is_dir($libraries_path)) {
    drush_op('mkdir', $libraries_path);
    drush_log(dt('Directory @path was created', array('@path' => $libraries_path)), 'success');
  }

  // Go to libraries path.
  chdir($libraries_path);

  // Install Easychart library.
  $easychart_dir_name = 'easychart';
  $easychart_library = \Drupal::service('library.discovery')->getLibraryByName('easychart', 'lib.easycharts.full');
  if (!empty($easychart_library) && $file_path = drush_download_file($easychart_library['remote'])) {
    $filename = basename($file_path);

    // Remove Easychart library directory.
    if (is_dir($easychart_dir_name)) {
      drush_delete_dir($easychart_dir_name, TRUE);
      drush_log(dt('An existing Easychart plugin was deleted from @libraries_path.', array('@libraries_path' => $libraries_path)), 'success');
    }

    drush_tarball_extract($filename);
    drush_move_dir('easychart-master', $easychart_dir_name, TRUE);
  }
  if (is_dir($easychart_dir_name)) {
    drush_log(dt('Easychart library has been installed in /@libraries_path.', array('@libraries_path' => $libraries_path)), 'success');
  }
  else {
    drush_log(dt('Drush was unable to install the Easychart library in /@libraries_path.', array('@libraries_path' => $libraries_path)), 'error');
  }

  // Install Highcharts library.
  $highcharts_dir_name = 'highcharts';
  $highcharts_library = \Drupal::service('library.discovery')->getLibraryByName('easychart', 'lib.highcharts');
  if (!empty($highcharts_library) && $file_path = drush_download_file($highcharts_library['remote'])) {
    $filename = basename($file_path);

    // Remove any existing Highcharts library directory.
    if (is_dir($highcharts_dir_name)) {
      drush_delete_dir($highcharts_dir_name, TRUE);
      drush_log(dt('An existing Highcharts plugin was deleted from @libraries_path.', array('@libraries_path' => $libraries_path)), 'success');
    }

    drush_tarball_extract($filename, $highcharts_dir_name);
  }
  if (is_dir($highcharts_dir_name)) {
    drush_log(dt('Highcharts library has been installed in /@libraries_path.', array('@libraries_path' => $libraries_path)), 'success');
  }
  else {
    drush_log(dt('Drush was unable to install the Highcharts library in /@libraries_path.', array('@libraries_path' => $libraries_path)), 'error');
  }

  // Set working directory back to the previous working directory.
  chdir($old_dir);
}
