<?php
/**
 * @file
 * Provide Drush integration for release building and dependency building.
 */

use Drupal\module_missing_message_fixer\ModuleMissingMessageFixer;

/**
 * Helper function to check for modules to fix.
 *
 * @param bool $return
 *   If we are to return to rows or just print the list.
 *
 * @return array[]|null
 *   An array of table rows, or NULL if $return === FALSE.
 */
function module_missing_message_fixer_check_modules($return = FALSE) {

  if ($return) {
    return ModuleMissingMessageFixer::getTableRows();
  }

  $rows = [];

  // Use a key for the head row that is not a valid module name.
  $rows['*HEAD*'] = ModuleMissingMessageFixer::getTableHeader();
  $rows += ModuleMissingMessageFixer::getTableRows();

  // Print Table here instead of in the hook_command.
  $output = count($rows) > 1 ? drush_format_table($rows, TRUE) : 'No Missing Modules Found!!!';
  drush_print($output);

  return NULL;
}

/**
 * Implements hook_drush_help().
 *
 * @param string $section
 *
 * @return null|string
 */
function module_missing_message_fixer_drush_help($section) {
  switch ($section) {
    case 'module-missing-message-fixer-list':
      return dt("Returns a list of modules that have missing messages.");
    case 'module-missing-message-fixer-fix':
      return dt("Fixes a specified module that has missing messages. (optional --all)");
    default:
      return NULL;
  }
}

/**
 * Implements hook_drush_command().
 */
function module_missing_message_fixer_drush_command() {
  $items = [];
  $items['module-missing-message-fixer-list'] = array(
    'description' => dt('Returns a list of modules that have missing messages.'),
    'aliases' => array(
      'mmmfl',
    ),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUPAL_FULL
  );
  $items['module-missing-message-fixer-fix'] = array(
    'description' => dt('Fixes modules that have missing messages.'),
    'aliases' => array(
      'mmmff',
    ),
    'arguments' => array(
      'name' => 'The name of the module to fix.',
    ),
    'options' => array(
      'all' => dt('Fixes all module missing messages'),
    ),
    'bootstrap' => DRUSH_BOOTSTRAP_DRUPAL_FULL
  );
  return $items;
}

/**
 * Drush command.
 *
 * Displays a list of modules that have missing messages.
 */
function drush_module_missing_message_fixer_list() {
  module_missing_message_fixer_check_modules();
}

/**
 * Drush command.
 *
 * @param string $name
 *        The name of the module to fix messages for.
 */
function drush_module_missing_message_fixer_fix($name = NULL) {
  $modules = [];
  $rows = module_missing_message_fixer_check_modules(TRUE);
  if (drush_get_option('all') !== NULL) {
    if (!empty($rows)) {
      foreach ($rows as $row) {
        $modules[] = $row['name'];
      }
    }
  }
  elseif ($name !== NULL) {
    // If this exists in the table.
    if (strpos(json_encode($rows), $name)) {
      $modules[] = $name;
    }
    else {
      drush_log(dt('Module ' . $name . ' was not found.'), 'error');
    }
  }
  else {
    drush_log(dt('Missing input, provide module name or run with --all'), 'error');
  }
  // Delete if there is no modules.
  if (count($modules) > 0) {
    $query = \Drupal::database()->delete('key_value');
    $query->condition('collection', 'system.schema');
    $query->condition('name', $modules, 'IN');
    $query->execute();

    if (drush_get_option('all') !== NULL) {
      drush_log(dt('All missing references have been removed.'), 'success');
    }
    elseif ($name !== NULL) {
      if (in_array($name, $modules, TRUE)) {
        drush_log(dt('Reference to ' . $name . ' (if found) has been removed.'), 'success');
      }
    }
  }
}
