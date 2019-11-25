<?php

namespace Drupal\purge\Plugin\Purge\Processor;

use Drupal\Component\Plugin\PluginManagerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\purge\IteratingServiceBaseTrait;
use Drupal\purge\ModifiableServiceBaseTrait;
use Drupal\purge\ServiceBase;

/**
 * Provides a service that provides access to loaded processors.
 */
class ProcessorsService extends ServiceBase implements ProcessorsServiceInterface {
  use IteratingServiceBaseTrait;
  use ModifiableServiceBaseTrait;

  /**
   * The factory for configuration objects.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Construct the processors service.
   *
   * @param \Drupal\Component\Plugin\PluginManagerInterface $pluginManager
   *   The plugin manager for this service.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The factory for configuration objects.
   */
  public function __construct(PluginManagerInterface $pluginManager, ConfigFactoryInterface $config_factory) {
    $this->pluginManager = $pluginManager;
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   *
   * @ingroup countable
   */
  public function count() {
    $this->initializePluginInstances();
    return count($this->instances);
  }

  /**
   * {@inheritdoc}
   */
  public function get($plugin_id) {
    $this->initializePluginInstances();
    foreach ($this as $processor) {
      if ($processor->getPluginId() === $plugin_id) {
        return $processor;
      }
    }
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getPluginsEnabled() {
    if (is_null($this->pluginsEnabled)) {

      // Build a mapping of all plugins and whether they are enabled by default.
      $this->pluginsEnabled = [];
      foreach ($this->getPlugins() as $plugin_id => $definition) {
        $enable_by_default = ($definition['enable_by_default'] === TRUE);
        $this->pluginsEnabled[$plugin_id] = $enable_by_default;
      }

      // Override the mapping with information stored in CMI, then filter out
      // everything that isn't enabled and finally flip the array with just ids.
      $processors = $this->configFactory->get('purge.plugins')->get('processors');
      if (!is_null($processors)) {
        foreach ($processors as $setting) {
          if (isset($this->pluginsEnabled[$setting['plugin_id']])) {
            $this->pluginsEnabled[$setting['plugin_id']] = $setting['status'];
          }
        }
      }
      foreach ($this->pluginsEnabled as $plugin_id => $status) {
        if (!$status) {
          unset($this->pluginsEnabled[$plugin_id]);
        }
      }
      $this->pluginsEnabled = array_keys($this->pluginsEnabled);
    }
    return $this->pluginsEnabled;
  }

  /**
   * {@inheritdoc}
   */
  public function reload() {
    parent::reload();
    // Without this, the tests will throw "failed to instantiate user-supplied
    // statement class: CREATE TABLE {cache_config}".
    // phpcs:ignore DrupalPractice.Objects.GlobalDrupal.GlobalDrupal
    $this->configFactory = \Drupal::configFactory();
    // Drush commands appreciate it when the config cache gets cleared.
    if (php_sapi_name() === 'cli') {
      // phpcs:ignore DrupalPractice.Objects.GlobalDrupal.GlobalDrupal
      \Drupal::cache('config')->deleteAll();
    }
    $this->reloadIterator();
  }

  /**
   * {@inheritdoc}
   */
  public function setPluginsEnabled(array $plugin_ids) {
    $definitions = $this->pluginManager->getDefinitions();

    // Gather all plugins mentioned in CMI and those available right now, set
    // them disabled first. Then flip the switch for given plugin_ids.
    $setting_assoc = [];
    $instances = $this->configFactory->get('purge.plugins')->get('processors');
    if (!is_null($instances)) {
      foreach ($instances as $inst) {
        $setting_assoc[$inst['plugin_id']] = FALSE;
      }
    }
    foreach ($definitions as $definition) {
      $setting_assoc[$definition['id']] = FALSE;
    }
    foreach ($plugin_ids as $plugin_id) {
      if (!isset($definitions[$plugin_id])) {
        throw new \LogicException('Invalid plugin_id.');
      }
      $setting_assoc[$plugin_id] = TRUE;
    }

    // Convert the array to the CMI storage format and commit.
    $setting = [];
    foreach ($setting_assoc as $plugin_id => $status) {
      $setting[] = [
        'plugin_id' => $plugin_id,
        'status' => $status,
      ];
    }
    $this->configFactory
      ->getEditable('purge.plugins')
      ->set('processors', $setting)
      ->save();
    $this->reload();
  }

}
