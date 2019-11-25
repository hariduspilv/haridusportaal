<?php

namespace Drupal\config_sync\Commands;

use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\config_sync\ConfigSyncListerInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\StorageInterface;
use Drush\Commands\DrushCommands;
use Drush\Drupal\Commands\config\ConfigCommands;
use Drush\Drupal\Commands\config\ConfigImportCommands;
use Drush\Exceptions\UserAbortException;

/**
 * Drush integration for the Configuration Synchronizer module.
 */
class ConfigSyncCommands extends DrushCommands {

  /**
   * The config synchronisation lister service.
   *
   * @var \Drupal\config_sync\ConfigSyncListerInterface
   */
  protected $configSyncLister;

  /**
   * The active configuration storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeStorage;

  /**
   * The configuration manager.
   *
   * @var \Drupal\Core\Config\ConfigManagerInterface
   */
  protected $configManager;

  /**
   * The service containing Drush commands for regular core config imports.
   *
   * @var \Drush\Drupal\Commands\config\ConfigImportCommands
   */
  protected $configImportCommands;

  /**
   * Constructs a new ConfigSyncCommands object.
   *
   * @param \Drupal\config_sync\ConfigSyncListerInterface $configSyncLister
   *   The config synchronisation lister service.
   * @param \Drupal\Core\Config\StorageInterface $activeStorage
   *   The active configuration storage.
   * @param \Drupal\Core\Config\ConfigManagerInterface $configManager
   *   The configuration manager.
   * @param \Drush\Drupal\Commands\config\ConfigImportCommands $configImportCommands
   *   The service containing Drush commands for regular core config imports.
   */
  public function __construct(ConfigSyncListerInterface $configSyncLister, StorageInterface $activeStorage, ConfigManagerInterface $configManager, ConfigImportCommands $configImportCommands) {
    parent::__construct();
    $this->configSyncLister = $configSyncLister;
    $this->activeStorage = $activeStorage;
    $this->configManager = $configManager;
    $this->configImportCommands = $configImportCommands;
  }

  /**
   * Displays a list of all extensions with available configuration updates.
   *
   * @command config-sync-list-updates
   * @usage drush config-sync-list-updates
   *   Display a list of all extensions with available configuration updates.
   * @aliases cs-list
   * @field-labels
   *   type: Operation type
   *   id: Config ID
   *   collection: Collection
   *   label: Label
   *   extension_type: Extension type
   *   extension: Extension
   * @default-fields extension,type,label
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   */
  public function syncListUpdates($options = ['format' => 'table']) {
    $rows = [];
    foreach ($this->configSyncLister->getExtensionChangelists() as $extension_type => $extensions) {
      foreach ($extensions as $extension_id => $collection_changelists) {
        foreach ($collection_changelists as $collection => $operation_types) {
          foreach ($operation_types as $operation_type => $configurations) {
            foreach ($configurations as $config_id => $config_label) {
              $rows[$config_id] = [
                'type' => $operation_type,
                'id' => $config_id,
                'collection' => $collection === '' ? 'default' : $collection,
                'label' => $config_label,
                'extension_type' => $extension_type,
                'extension' => $extension_id,
              ];
            }
          }
        }
      }
    }

    return new RowsOfFields($rows);
  }

}
