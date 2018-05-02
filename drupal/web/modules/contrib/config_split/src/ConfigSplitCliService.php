<?php

namespace Drupal\config_split;

use Drupal\config_filter\Config\FilteredStorage;
use Drupal\config_filter\ConfigFilterManagerInterface;
use Drupal\config_filter\ConfigFilterStorageFactory;
use Drupal\config_split\Config\GhostStorage;
use Drupal\Core\Config\ConfigImporter;
use Drupal\Core\Config\ConfigImporterException;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\FileStorageFactory;
use Drupal\Core\Config\StorageComparer;
use Drupal\Core\Config\StorageInterface;
use Drupal\Core\Config\TypedConfigManagerInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ModuleInstallerInterface;
use Drupal\Core\Extension\ThemeHandlerInterface;
use Drupal\Core\Lock\LockBackendInterface;
use Drupal\Core\StringTranslation\TranslationInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Class ConfigSplitCliService.
 *
 * @package Drupal\config_split
 *
 * @internal This service is not an api and may change at any time.
 */
class ConfigSplitCliService {

  /**
   * The return value indicating no changes were imported.
   */
  const NO_CHANGES = 'no_changes';

  /**
   * The return value indicating that the import is already in progress.
   */
  const ALREADY_IMPORTING = 'already_importing';

  /**
   * The return value indicating that the process is complete.
   */
  const COMPLETE = 'complete';

  /**
   * The filter manager.
   *
   * @var \Drupal\config_filter\ConfigFilterManagerInterface
   */
  protected $configFilterManager;

  /**
   * The config filter storage factory.
   *
   * @var \Drupal\config_filter\ConfigFilterStorageFactory
   */
  protected $storageFactory;

  /**
   * Drupal\Core\Config\ConfigManager definition.
   *
   * @var \Drupal\Core\Config\ConfigManager
   */
  protected $configManager;

  /**
   * Active Config Storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeStorage;

  /**
   * Sync Config Storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $syncStorage;

  /**
   * Drupal\Component\EventDispatcher\ContainerAwareEventDispatcher definition.
   *
   * @var \Drupal\Component\EventDispatcher\ContainerAwareEventDispatcher
   */
  protected $eventDispatcher;

  /**
   * Drupal\Core\ProxyClass\Lock\DatabaseLockBackend definition.
   *
   * @var \Drupal\Core\ProxyClass\Lock\DatabaseLockBackend
   */
  protected $lock;

  /**
   * Drupal\Core\Config\TypedConfigManager definition.
   *
   * @var \Drupal\Core\Config\TypedConfigManager
   */
  protected $configTyped;

  /**
   * Drupal\Core\Extension\ModuleHandler definition.
   *
   * @var \Drupal\Core\Extension\ModuleHandler
   */
  protected $moduleHandler;

  /**
   * Drupal\Core\ProxyClass\Extension\ModuleInstaller definition.
   *
   * @var \Drupal\Core\ProxyClass\Extension\ModuleInstaller
   */
  protected $moduleInstaller;

  /**
   * Drupal\Core\Extension\ThemeHandler definition.
   *
   * @var \Drupal\Core\Extension\ThemeHandler
   */
  protected $themeHandler;

  /**
   * Drupal\Core\StringTranslation\TranslationManager definition.
   *
   * @var \Drupal\Core\StringTranslation\TranslationManager
   */
  protected $stringTranslation;

  /**
   * List of messages.
   *
   * @var array
   */
  protected $errors;

  /**
   * Constructor.
   */
  public function __construct(
    ConfigFilterManagerInterface $config_filter_manager,
    ConfigFilterStorageFactory $storageFactory,
    ConfigManagerInterface $config_manager,
    StorageInterface $active_storage,
    StorageInterface $sync_storage,
    EventDispatcherInterface $event_dispatcher,
    LockBackendInterface $lock,
    TypedConfigManagerInterface $config_typed,
    ModuleHandlerInterface $module_handler,
    ModuleInstallerInterface $module_installer,
    ThemeHandlerInterface $theme_handler,
    TranslationInterface $string_translation
  ) {
    $this->configFilterManager = $config_filter_manager;
    $this->storageFactory = $storageFactory;
    $this->configManager = $config_manager;
    $this->activeStorage = $active_storage;
    $this->syncStorage = $sync_storage;
    $this->eventDispatcher = $event_dispatcher;
    $this->lock = $lock;
    $this->configTyped = $config_typed;
    $this->moduleHandler = $module_handler;
    $this->moduleInstaller = $module_installer;
    $this->themeHandler = $theme_handler;
    $this->stringTranslation = $string_translation;
    $this->errors = [];
  }

  /**
   * Handle the export interaction.
   *
   * @param string|null $split
   *   The split name to export, null for standard export.
   * @param \Symfony\Component\Console\Style\StyleInterface|\ConfigSplitDrush8Io $io
   *   The io interface of the cli tool calling the method.
   * @param callable $t
   *   The translation function akin to t().
   * @param bool $confirmed
   *   Whether the export is already confirmed by the console input.
   */
  public function ioExport($split, $io, callable $t, $confirmed = FALSE) {
    if (!$split) {
      $message = $t('Do a normal (including filters) config export?');
      $storage = $this->syncStorage;
    }
    else {
      $config_name = $this->getSplitName($split);

      $plugin_id = $this->getPluginIdFromConfigName($config_name);
      $filter = $this->configFilterManager->getFilterInstance($plugin_id);

      // Use a GhostStorage so that we only export the split.
      $storage = $this->storageFactory->getFilteredStorage(FileStorageFactory::getSync(), ['config.storage.sync'], [$plugin_id]);
      $storage = new FilteredStorage(new GhostStorage($storage), [$filter]);

      $message = $t('The following directories will be purged and used for exporting configuration:');
      $message .= "\n";
      $message .= $this->getDestination($config_name);
      $message .= "\n";
      $message .= $t('Export the configuration?');
    }

    if ($confirmed || $io->confirm($message)) {
      $this->export($storage);
      $io->success($t("Configuration successfully exported."));
    }
  }

  /**
   * Handle the import interaction.
   *
   * @param string|null $split
   *   The split name to import, null for standard import.
   * @param \Symfony\Component\Console\Style\StyleInterface|\ConfigSplitDrush8Io $io
   *   The $io interface of the cli tool calling.
   * @param callable $t
   *   The translation function akin to t().
   * @param bool $confirmed
   *   Whether the import is already confirmed by the console input.
   */
  public function ioImport($split, $io, callable $t, $confirmed = FALSE) {
    if (!$split) {
      $message = $t('Do a normal (including filters) config import?');
      $storage = $this->syncStorage;
    }
    else {
      $config_name = $this->getSplitName($split);
      $filter = $this->configFilterManager->getFilterInstance($this->getPluginIdFromConfigName($config_name));

      // Filter the active storage so we only import the split.
      $storage = new FilteredStorage($this->activeStorage, [$filter]);

      $message = $t('The following directory will be used to merge config into the active storage:');
      $message .= "\n";
      $message .= $this->getDestination($config_name);
      $message .= "\n";
      $message .= $t('Import the configuration?');
    }

    try {
      if ($confirmed || $io->confirm($message)) {
        $status = $this->import($storage);
        switch ($status) {
          case ConfigSplitCliService::COMPLETE:
            $io->success($t("Configuration successfully imported."));
            break;

          case ConfigSplitCliService::NO_CHANGES:
            $io->text($t("There are no changes to import."));
            break;

          case ConfigSplitCliService::ALREADY_IMPORTING:
            $io->error($t("Another request may be synchronizing configuration already."));
            break;

          default:
            $io->error($t("Something unexpected happened"));
            break;
        }
      }
    }
    catch (ConfigImporterException $e) {
      $io->error($t('There have been errors importing: @errors', ['@errors' => strip_tags(implode("\n", $this->getErrors()))]));
    }
  }

  /**
   * Export the configuration.
   *
   * This is the quintessential config export.
   *
   * @param \Drupal\Core\Config\StorageInterface $storage
   *   The config storage to export to.
   * @param \Drupal\Core\Config\StorageInterface|null $active
   *   The config storage to export from (optional).
   */
  public function export(StorageInterface $storage, StorageInterface $active = NULL) {
    if (!isset($active)) {
      // Use the active storage.
      $active = $this->activeStorage;
    }

    // Make the storage to be the default collection.
    if ($storage->getCollectionName() != StorageInterface::DEFAULT_COLLECTION) {
      // This is probably not necessary, but we do it as a precaution.
      $storage = $storage->createCollection(StorageInterface::DEFAULT_COLLECTION);
    }

    // Delete all, the filters are responsible for keeping some configuration.
    $storage->deleteAll();

    // Get the default active storage to copy it to the sync storage.
    if ($active->getCollectionName() != StorageInterface::DEFAULT_COLLECTION) {
      // This is probably not necessary, but we do it as a precaution.
      $active = $active->createCollection(StorageInterface::DEFAULT_COLLECTION);
    }

    // Copy everything.
    foreach ($active->listAll() as $name) {
      $storage->write($name, $active->read($name));
    }

    // Get all override data from the remaining collections.
    foreach ($active->getAllCollectionNames() as $collection) {
      $source_collection = $active->createCollection($collection);
      $destination_collection = $storage->createCollection($collection);
      // Delete everything in the collection sub-directory.
      try {
        $destination_collection->deleteAll();
      }
      catch (\UnexpectedValueException $exception) {
        // Deleting a non-existing folder for collections might fail.
      }

      foreach ($source_collection->listAll() as $name) {
        $destination_collection->write($name, $source_collection->read($name));
      }

    }

  }

  /**
   * Import the configuration.
   *
   * This is the quintessential config import.
   *
   * @param \Drupal\Core\Config\StorageInterface $storage
   *   The config storage to import from.
   *
   * @return string
   *   The state of importing.
   */
  public function import(StorageInterface $storage) {

    $comparer = new StorageComparer($storage, $this->activeStorage, $this->configManager);

    if (!$comparer->createChangelist()->hasChanges()) {
      return static::NO_CHANGES;
    }

    $importer = new ConfigImporter(
      $comparer,
      $this->eventDispatcher,
      $this->configManager,
      $this->lock,
      $this->configTyped,
      $this->moduleHandler,
      $this->moduleInstaller,
      $this->themeHandler,
      $this->stringTranslation
    );

    if ($importer->alreadyImporting()) {
      return static::ALREADY_IMPORTING;
    }

    try {
      // Do the import with the ConfigImporter.
      $importer->import();
    }
    catch (ConfigImporterException $e) {
      // Catch and re-trow the ConfigImporterException.
      $this->errors = $importer->getErrors();
      throw $e;
    }

    return static::COMPLETE;
  }

  /**
   * Returns error messages created while running the import.
   *
   * @return array
   *   List of messages.
   */
  public function getErrors() {
    return $this->errors;
  }

  /**
   * Get the plugin id of a split filter from a config name.
   *
   * @param string $name
   *   The config name.
   *
   * @return string
   *   The plugin id.
   */
  protected function getPluginIdFromConfigName($name) {
    return 'config_split:' . str_replace('config_split.config_split.', '', $name);
  }

  /**
   * Get the configuration name from the short name.
   *
   * @param string $name
   *   The name to get the config name for.
   *
   * @return string
   *   The split configuration name.
   */
  protected function getSplitName($name) {

    if (strpos($name, 'config_split.config_split.') !== 0) {
      $name = 'config_split.config_split.' . $name;
    }

    if (!in_array($name, $this->activeStorage->listAll('config_split.config_split.'))) {
      $names = '';
      foreach ($this->activeStorage->listAll('config_split.config_split.') as $name) {
        $names .= $name . ', ';
      }

      throw new \InvalidArgumentException('The following split is not available: ' . $name . PHP_EOL . 'Available names: ' . $names);
    }

    return $name;
  }

  /**
   * Returns the directory path to export or "database".
   *
   * @param string $config_name
   *   The configuration name.
   *
   * @return string
   *   The destination.
   */
  protected function getDestination($config_name) {
    $destination = $this->configManager->getConfigFactory()->get($config_name)->get('folder');
    if ($destination == '') {
      $destination = 'dedicated database table.';
    }
    return $destination;
  }

}
