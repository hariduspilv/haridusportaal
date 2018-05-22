<?php

/**
 * @file
 * Contains \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer.
 */

namespace Drupal\module_missing_message_fixer;

class ModuleMissingMessageFixer {

  /**
   * Set the table headers for the ui and drush.
   *
   * @return string[]
   *   Format: $[$column_key] = $cell
   */
  public static function getTableHeader() {
    return array(
      'name' => 'Name',
      'type' => 'Type',
    );
  }


  /**
   * Produces one table row for each missing module.
   *
   * The table rows are suitable for drush and for the admin UI.
   *
   * @return array[]
   *   Format: $[$extension_name][$column_key] = $cell
   */
  public static function getTableRows() {
    // Initalize vars.
    $rows = [];
    $i = 0;
    $db = \Drupal::database();

    // Grab all the modules in the system table.
    $results = $db->select('key_value', 'k')
      ->fields('k', ['name'])
      ->condition('collection', 'system.schema')
      ->execute()
      ->fetchAll();

    // Go through the query and check the missing modules.
    // Plus do our checks to see what's wrong.
    foreach ($results as $record) {

      if ($record->name === 'default') {
        continue;
      }

      // Grab the checker.
      $filename = drupal_get_filename('module', $record->name);

      if ($filename === NULL) {
        // Report this module in the table.
        $rows[$record->name] = array(
          'name' => $record->name,
          'type' => 'module',
        );
        continue;
      }

      $message = NULL;
      $replacements = array(
        '@name' => $record->name,
        '@type' => 'module',
        '@file' => $filename,
      );
      if (!file_exists($filename)) {
        // This case is unexpected, because drupal_get_filename() should take care
        // of it already.
        $message = 'The file @file for @name @type is missing.';
      }
      elseif (!is_readable($filename)) {
        // This case is unexpected, because drupal_get_filename() should take care
        // of it already.
        $message = 'The file @file for @name @type is not readable.';
      }
      else {
        // Verify if *.info file exists.
        // See https://www.drupal.org/node/2789993#comment-12306555
        $info_filename = dirname($filename) . '/' . $record->name . '.info.yml';
        $replacements['@info_file'] = $info_filename;
        if (!file_exists($info_filename)) {
          $message = 'The *.info.yml file @info_file for @name @type is missing.';

        }
        elseif (!is_readable($info_filename)) {
          $message = 'The *.info.yml file @info_file for @name @type is not readable.';
        }
      }

      if ($message !== NULL) {
        // This case should never occur.
        drupal_set_message(
          t($message, $replacements),
          'warning',
          FALSE);
      }
    }

    return $rows;
  }
}
