<?php

namespace Drupal\module_missing_message_fixer;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Database\Connection;
use Drupal\Core\Messenger\MessengerInterface;

/**
 * Class ModuleMissingMessageFixer.
 *
 * @package Drupal\module_missing_message_fixer
 */
class ModuleMissingMessageFixer {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * The Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected $messenger;

  /**
   * Constructs a new UserSelection object.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection.
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *   The messenger service.
   */
  public function __construct(Connection $connection, MessengerInterface $messenger) {
    $this->connection = $connection;
    $this->messenger = $messenger;
  }

  /**
   * {@inheritdoc}
   */
  public function create(ContainerInterface $container) {
    return new static(
      $container->get('database'),
      $container->get('messenger')
    );
  }

  /**
   * Helper function to check for modules to fix.
   *
   * @param bool $return
   *   If we are to return to rows or just print the list.
   *
   * @return string|null
   *   The printed output.
   */
  public function checkModules($return = FALSE) {

    if ($return) {
      return $this->getTableRows();
    }

    $rows = [];

    // Use a key for the head row that is not a valid module name.
    $rows['*HEAD*'] = ModuleMissingMessageFixer::getTableHeader();
    $rows += ModuleMissingMessageFixer::getTableRows();

    // Print Table here instead of in the hook_command.
    $output = count($rows) > 1 ?
      drush_format_table($rows, TRUE) : 'No Missing Modules Found!!!';
    drush_print($output);

    return NULL;
  }

  /**
   * Set the table headers for the ui and drush.
   *
   * @return string[]
   *   Format: $[$column_key] = $cell
   */
  public function getTableHeader() {
    return [
      'name' => 'Name',
      'type' => 'Type',
    ];
  }

  /**
   * Produces one table row for each missing module.
   *
   * The table rows are suitable for drush and for the admin UI.
   *
   * @return array[]
   *   Format: $[$extension_name][$column_key] = $cell
   */
  public function getTableRows() {
    // Initalize vars.
    $rows = [];

    // Grab all the modules in the system table.
    $results = $this->connection->select('key_value', 'k')
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
        $rows[$record->name] = [
          'name' => $record->name,
          'type' => 'module',
        ];
        continue;
      }

      $message = NULL;
      $replacements = [
        '@name' => $record->name,
        '@type' => 'module',
        '@file' => $filename,
      ];
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
        $this->messenger->addWarning(
          t($message, $replacements),
          FALSE);
      }
    }

    return $rows;
  }

}
