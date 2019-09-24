<?php

namespace Drupal\config_distro\Commands;

use Drupal\config_distro\Event\ConfigDistroEvents;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\FileStorage;
use Drupal\Core\Config\StorageComparer;
use Drupal\Core\Config\StorageInterface;
use Drush\Commands\DrushCommands;
use Drush\Drupal\Commands\config\ConfigCommands;
use Drush\Drupal\Commands\config\ConfigImportCommands;
use Drush\Exceptions\UserAbortException;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Drush integration for the Configuration Synchronizer module.
 */
class ConfigDistroCommands extends DrushCommands {

  /**
   * The active configuration storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeStorage;

  /**
   * The merged storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $distroStorage;

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
   * The event dispatcher to notify the system that the config was imported.
   *
   * @var \Symfony\Component\EventDispatcher\EventDispatcherInterface
   */
  protected $eventDispatcher;

  /**
   * Constructs a new ConfigSyncCommands object.
   *
   * @param \Drupal\Core\Config\StorageInterface $activeStorage
   *   The active configuration storage.
   * @param \Drupal\Core\Config\StorageInterface $distroStorage
   *   The merged storage.
   * @param \Drupal\Core\Config\ConfigManagerInterface $configManager
   *   The configuration manager.
   * @param \Drush\Drupal\Commands\config\ConfigImportCommands $configImportCommands
   *   The service containing Drush commands for regular core config imports.
   * @param \Symfony\Component\EventDispatcher\EventDispatcherInterface $eventDispatcher
   *   The event dispatcher to tell other modules about the successful import.
   */
  public function __construct(StorageInterface $activeStorage, StorageInterface $distroStorage, ConfigManagerInterface $configManager, ConfigImportCommands $configImportCommands, EventDispatcherInterface $eventDispatcher) {
    parent::__construct();
    $this->activeStorage = $activeStorage;
    $this->distroStorage = $distroStorage;
    $this->configManager = $configManager;
    $this->configImportCommands = $configImportCommands;
    $this->eventDispatcher = $eventDispatcher;
  }

  /**
   * Apply configuration updates.
   *
   * @command config-distro-update
   * @option preview Format for displaying proposed changes. Recognized values: list, diff.
   * @usage drush config-distro-update
   *   Apply updates from distribution.
   * @aliases cd-update
   */
  public function distroUpdate($options = ['preview' => 'list']) {
    $active_storage = $this->activeStorage;
    $source_storage = $this->distroStorage;
    $storage_comparer = new StorageComparer($this->distroStorage, $this->activeStorage, $this->configManager);

    // This is copied from the Drush command.
    if (!$storage_comparer->createChangelist()->hasChanges()) {
      $this->logger()->notice(('There are no changes to import.'));
      return;
    }

    if ($options['preview'] == 'list') {
      $change_list = [];
      foreach ($storage_comparer->getAllCollectionNames() as $collection) {
        $change_list[$collection] = $storage_comparer->getChangelist(NULL, $collection);
      }
      $table = ConfigCommands::configChangesTable($change_list, $this->output());
      $table->render();
    }
    else {
      // @TODO: make this work again after drush is fixed...
      // Copy active storage to a temporary directory.
      $temp_active_dir = drush_tempdir();
      $temp_active_storage = new FileStorage($temp_active_dir);
      ConfigCommands::copyConfig($active_storage, $temp_active_storage);

      // Copy sync storage to a temporary directory as it could be
      // modified by the partial option or by decorated sync storages.
      $temp_sync_dir = drush_tempdir();
      $temp_sync_storage = new FileStorage($temp_sync_dir);
      ConfigCommands::copyConfig($source_storage, $temp_sync_storage);

      drush_shell_exec('diff -u %s %s', $temp_active_dir, $temp_sync_dir);
      $output = drush_shell_exec_output();
      $this->output()->writeln(implode("\n", $output));
    }

    if ($this->io()->confirm(dt('Import the listed configuration changes?'))) {
      // Import the config using the default Drush command.
      // @see \Drush\Drupal\Commands\config\ConfigImportCommands::doImport()
      drush_op([$this->configImportCommands, 'doImport'], $storage_comparer);

      // Dispatch an event to notify modules about the successful import.
      $this->eventDispatcher->dispatch(ConfigDistroEvents::IMPORT);
    }
    else {
      throw new UserAbortException();
    }
  }

}
