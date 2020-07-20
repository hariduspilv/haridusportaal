<?php

namespace Drupal\config_sync\Plugin\ConfigFilter;

use Drupal\config_sync\ConfigSyncListerInterface;
use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Extension\ThemeHandlerInterface;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Deriver for SyncFilter filters.
 */
class SyncFilterDeriver extends DeriverBase implements ContainerDeriverInterface {

  use StringTranslationTrait;

  /**
   * The configuration synchronizer lister.
   *
   * @var \Drupal\config_sync\configSyncListerInterface
   */
  protected $configSyncLister;

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * The theme handler.
   *
   * @var \Drupal\Core\Extension\ThemeHandlerInterface
   */
  protected $themeHandler;

  /**
   * The state storage object.
   *
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * SyncFilter constructor.
   *
   * @param \Drupal\config_sync\ConfigSyncListerInterface $config_sync_lister
   *   The configuration synchronizer lister.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param \Drupal\Core\Extension\ThemeHandlerInterface $theme_handler
   *   The theme handler.
   * @param \Drupal\Core\State\StateInterface $state
   *   The state storage object.
   */
  public function __construct(ConfigSyncListerInterface $config_sync_lister, ModuleHandlerInterface $module_handler, ThemeHandlerInterface $theme_handler, StateInterface $state) {
    $this->configSyncLister = $config_sync_lister;
    $this->moduleHandler = $module_handler;
    $this->themeHandler = $theme_handler;
    $this->state = $state;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, $base_plugin_id) {
    return new static(
      $container->get('config_sync.lister'),
      $container->get('module_handler'),
      $container->get('theme_handler'),
      $container->get('state')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDerivativeDefinitions($base_plugin_definition) {
    $plugin_data = $this->state->get('config_sync.plugins', []);
    $type_labels = [
      'module' => $this->t('Module'),
      'theme' => $this->t('Theme'),
    ];
    foreach ($this->configSyncLister->getExtensionChangelists() as $type => $extension_changelists) {
      foreach (array_keys($extension_changelists) as $name) {
        $key = $type . '_' . $name;
        $this->derivatives[$key] = $base_plugin_definition;
        $this->derivatives[$key]['extension_type'] = $type;
        $this->derivatives[$key]['extension_name'] = $name;
        switch ($type) {
          case 'module':
            $label = $this->moduleHandler->getName($name);
            $type_label = $this->t('Module');
            break;
          case 'theme':
            $label = $this->themeHandler->getName($name);
            $type_label = $this->t('Theme');
            break;
        }
        $this->derivatives[$key]['label'] = $this->t('@type_label: @label', ['@type_label' => $type_label, '@label' => $label]);
        // Status can be overridden in the state.
        $this->derivatives[$key]['status'] = !isset($plugin_data[$type][$name]['status']) || ($plugin_data[$type][$name]['status'] === TRUE);
      }
    }

    return $this->derivatives;
  }

}
