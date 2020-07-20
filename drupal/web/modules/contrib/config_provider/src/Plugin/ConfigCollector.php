<?php

namespace Drupal\config_provider\Plugin;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\StorageInterface;

/**
 * Class for invoking configuration providers..
 */
class ConfigCollector implements ConfigCollectorInterface {

  /**
   * The configuration factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

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
   * The provider configuration storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $providerStorage;

  /**
   * The configuration provider manager.
   *
   * @var \Drupal\config_provider\Plugin\ConfigProviderManager
   */
  protected $configProviderManager;

  /**
   * The name of the currently active installation profile.
   *
   * @var string
   */
  protected $installProfile;

  /**
   * The configuration provider plugin instances.
   *
   * @var \Drupal\config_provider\Plugin\ConfigProvider
   */
  protected $configProviders;

  /**
   * Constructor for ConfigCollector objects.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The configuration factory.
   * @param \Drupal\Core\Config\StorageInterface $active_storage
   *   The active configuration storage.
   * @param \Drupal\Core\Config\ConfigManagerInterface $config_manager
   *   The configuration manager.
   * @param \Drupal\Core\Config\StorageInterface $provider_storage
   *   The provider configuration storage.
   * @param \Drupal\config_provider\Plugin\ConfigProviderManager $config_provider_manager
   *   The configuration provider manager.
   * @param string $install_profile
   *   (optional) The current installation profile. This parameter will be
   *   mandatory in Drupal 9.0.0.
   */
  public function __construct(ConfigFactoryInterface $config_factory, StorageInterface $active_storage, ConfigManagerInterface $config_manager, StorageInterface $provider_storage, ConfigProviderManager $config_provider_manager, $install_profile = NULL) {
    $this->configFactory = $config_factory;
    $this->activeStorage = $active_storage;
    $this->configManager = $config_manager;
    $this->providerStorage = $provider_storage;
    $this->configProviderManager = $config_provider_manager;
    if (is_null($install_profile)) {
      @trigger_error('Install profile will be a mandatory parameter in Drupal 9.0.', E_USER_DEPRECATED);
    }
    $this->installProfile = $install_profile ?: \Drupal::installProfile();
    $this->configProviders = [];
  }

  /**
   * {@inheritdoc}
   */
  public function getConfigProviders() {
    if (empty($this->configProviders)) {
      $definitions = $this->configProviderManager->getDefinitions();
      foreach (array_keys($definitions) as $id) {
        $this->initConfigProviderInstance($id);
      }
    }
    return $this->configProviders;
  }

  /**
   * {@inheritdoc}
   */
  public function addInstallableConfig(array $extensions = []) {
    // Start with an empty storage.
    $this->providerStorage->deleteAll();
    foreach ($this->providerStorage->getAllCollectionNames() as $collection) {
      $provider_collection = $this->providerStorage->createCollection($collection);
      $provider_collection->deleteAll();
    }

    /* @var \Drupal\config_provider\Plugin\ConfigProviderInterface[] $providers */
    $providers = $this->getConfigProviders();

    foreach ($providers as $provider) {
      $provider->addInstallableConfig($extensions);
    }
  }

  /**
   * Initializes an instance of the specified configuration provider.
   *
   * @param string $id
   *   The string identifier of the configuration provider.
   */
  protected function initConfigProviderInstance($id) {
    if (!isset($this->configProviders[$id])) {
      $instance = $this->configProviderManager->createInstance($id, []);
      $instance->setConfigFactory($this->configFactory);
      $instance->setActiveStorages($this->activeStorage);
      $instance->setConfigManager($this->configManager);
      $instance->setProviderStorage($this->providerStorage);
      $instance->setInstallProfile($this->installProfile);
      $this->configProviders[$id] = $instance;
    }
  }

}

