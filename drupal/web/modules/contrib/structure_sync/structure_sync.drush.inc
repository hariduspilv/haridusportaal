<?php

/**
 * @file
 * Drush commands for syncing structure content.
 */

use Drupal\structure_sync\StructureSyncHelper;

/**
 * Implements hook_drush_command().
 */
function structure_sync_drush_command() {
  $arguments = ['arguments' => ['choice' => 'The choice as argument']];
  $items = [];
  $items['export-taxonomies'] = [
    'description' => 'Export the taxonomies',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['et'],
  ];
  $items['import-taxonomies'] = [
    'description' => 'Import the taxonomies',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['it'],
    $arguments,
  ];
  $items['export-blocks'] = [
    'description' => 'Export blocks',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['eb'],
  ];
  $items['import-blocks'] = [
    'description' => 'Import blocks',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['ib'],
    $arguments,
  ];
  $items['export-menus'] = [
    'description' => 'Export menu links',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['em'],
  ];
  $items['import-menus'] = [
    'description' => 'Import menu links',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['im'],
    $arguments,
  ];

  $items['import-all'] = [
    'description' => 'Import menu links, Taxonomy and Blocks',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['ia'],
    $arguments,
  ];

  $items['export-all'] = [
    'description' => 'Export menu links, Taxonomy and Blocks',
    'drupal dependencies' => ['structure_sync'],
    'aliases' => ['ea'],
  ];
  return $items;
}

/**
 * Call back function drush_structure_sync_import_all()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_import_all($choice = FALSE) {
  drush_structure_sync_import_taxonomies($choice);
  drush_structure_sync_import_menus($choice);
  drush_structure_sync_import_blocks($choice);
}

/**
 * Call back function drush_structure_sync_export_all()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_export_all() {
  drush_structure_sync_export_taxonomies();
  drush_structure_sync_export_menus();
  drush_structure_sync_export_blocks();
}

/**
 * Call back function drush_structure_sync_export_taxonomies()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_export_taxonomies() {
  drush_print('Exporting taxonomies...');

  StructureSyncHelper::exportTaxonomies(['drush' => TRUE]);

  drush_log('Successfully exported taxonomies', 'ok');
}

/**
 * Call back function drush_structure_sync_import_taxonomies()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_import_taxonomies($choice = FALSE) {
  drush_print('Importing taxonomies...');

  $options = [
    'full' => 'Full',
    'safe' => 'Safe',
    'force' => 'Force',
  ];

  if (!$choice) {
    $choice = drush_choice($options, 'What import style would you like?');
  }

  if ($choice && array_key_exists($choice, $options)) {
    drush_print('Using "' . $options[$choice] . '" import style');

    StructureSyncHelper::importTaxonomies([
      'style' => $choice,
      'drush' => TRUE,
    ]);

    drush_log('Successfully imported taxonomies', 'ok');
  }
  else {
    drush_log('No choice made for import style on importing taxonomies', 'error');
  }
}

/**
 * Call back function drush_structure_sync_export_blocks()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_export_blocks() {
  drush_print('Exporting blocks...');

  StructureSyncHelper::exportCustomBlocks(['drush' => TRUE]);

  drush_log('Successfully exported blocks', 'ok');
}

/**
 * Call back function drush_structure_sync_import_blocks()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_import_blocks($choice = FALSE) {
  drush_print('Importing blocks...');

  $options = [
    'full' => 'Full',
    'safe' => 'Safe',
    'force' => 'Force',
  ];

  if (!$choice) {
    $choice = drush_choice($options, 'What import style would you like?');
  }

  if ($choice && array_key_exists($choice, $options)) {
    drush_print('Using "' . $options[$choice] . '" import style');

    StructureSyncHelper::importCustomBlocks([
      'style' => $choice,
      'drush' => TRUE,
    ]);

    drush_log('Successfully imported custom blocks', 'ok');
  }
  else {
    drush_log('No choice made for import style on importing custom blocks', 'error');
  }
}

/**
 * Call back function drush_structure_sync_export_menus()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_export_menus() {
  drush_print('Exporting menu links...');

  StructureSyncHelper::exportMenuLinks(['drush' => TRUE]);

  drush_log('Successfully exported menu links', 'ok');
}

/**
 * Call back function drush_structure_sync_import_menus()
 *
 * The call back function name in the  following format
 *   drush_{module_name}_{item_id_for_command}()
 */
function drush_structure_sync_import_menus($choice = FALSE) {
  drush_print('Importing menu links...');

  $options = [
    'full' => 'Full',
    'safe' => 'Safe',
    'force' => 'Force',
  ];

  if (!$choice) {
    $choice = drush_choice($options, 'What import style would you like?');
  }

  if ($choice && array_key_exists($choice, $options)) {
    drush_print('Using "' . $options[$choice] . '" import style');

    StructureSyncHelper::importMenuLinks([
      'style' => $choice,
      'drush' => TRUE,
    ]);

    drush_log('Successfully imported menu links', 'ok');
  }
  else {
    drush_log('No choice made for import style on importing menu links', 'error');
  }
}
