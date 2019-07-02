<?php

namespace Drupal\module_missing_message_fixer\Commands;

use Drush\Commands\DrushCommands;
use Drupal\module_missing_message_fixer\ModuleMissingMessageFixer;
use Drupal\Core\Database\Connection;
use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Class MmmfFixCommand.
 *
 * @package Drupal\module_missing_message_fixer
 */
class MmmfFixCommand extends DrushCommands {

  /**
   * The ModuleMissingMessageFixer service.
   *
   * @var \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer
   */
  protected $fixer;

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * MmmfFixCommand constructor.
   *
   * @param \Drupal\module_missing_message_fixer\ModuleMissingMessageFixer $mmmf
   *   The CLI service which allows interoperability.
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   */
  public function __construct(ModuleMissingMessageFixer $mmmf, Connection $connection, ConfigFactoryInterface $config_factory) {
    $this->fixer = $mmmf;
    $this->connection = $connection;
    $this->configFactory = $config_factory;
  }

  /**
   * Fixes the missing modules.
   *
   * @param string $name
   *   The name of the module to fix messages for.
   * @param array $options
   *   The all flag option.
   *
   * @command module-missing-message-fixer:fix
   *
   * @option all Fixes all module missing messages.
   *
   * @usage drush module-missing-message-fixer:fix stuff
   *   Fixes the stuff module.
   * @usage drush module-missing-message-fixer:fix stuff --all
   *   Fixes all the modules.
   *
   * @aliases mmmff
   */
  public function fixCommand($name = NULL, array $options = ['all' => NULL]) {
    $modules = [];
    $rows = $this->fixer->checkModules(TRUE);
    if ($options['all'] !== NULL) {
      if (!empty($rows)) {
        foreach ($rows as $row) {
          $modules[] = $row['name'];

          // Clean up old migrate configuration.
          $like = $this->connection->escapeLike($row['name'] . '.');
          $config_names = $this->connection->select('config', 'c')
            ->fields('c', ['name'])
            ->condition('name', $like . '%', 'LIKE')
            ->execute()
            ->fetchAll();

          // Delete each config using configFactory.
          foreach ($config_names as $config_name) {
            $this->configFactory->getEditable($config_name->name)->delete();
          }

          // Reminds users to export config.
          if (!empty($config_name)) {
            $this->output()->writeln(dt("Don't forget to export your config"));
          }
        }
      }
    }
    elseif ($name !== NULL) {
      // If this exists in the table.
      if (strpos(json_encode($rows), $name)) {
        $modules[] = $name;
      }
      else {
        $this->output()->writeln(dt('Module ' . $name . ' was not found.'), 'error');
      }
    }
    else {
      $this->output()->writeln(dt('Missing input, provide module name or run with --all'), 'error');
    }
    // Delete if there is no modules.
    if (count($modules) > 0) {
      $query = $this->connection->delete('key_value');
      $query->condition('collection', 'system.schema');
      $query->condition('name', $modules, 'IN');
      $query->execute();

      if ($options['all'] !== NULL) {
        $this->output()->writeln(dt('All missing references have been removed.'), 'success');
      }
      elseif ($name !== NULL) {
        if (in_array($name, $modules, TRUE)) {
          $this->output()->writeln(dt('Reference to ' . $name . ' (if found) has been removed.'), 'success');
        }
      }
    }
  }

}
