<?php

namespace Drupal\purge\Plugin\Purge\DiagnosticCheck;

use Drupal\Core\Extension\ModuleHandlerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Tests if the page_cache module is installed.
 *
 * @PurgeDiagnosticCheck(
 *   id = "page_cache",
 *   title = @Translation("Page cache"),
 *   description = @Translation("Tests if the page_cache module is installed."),
 *   dependent_queue_plugins = {},
 *   dependent_purger_plugins = {}
 * )
 */
class PageCacheCheck extends DiagnosticCheckBase implements DiagnosticCheckInterface {

  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * Construct a PageCacheCheck object.
   *
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(ModuleHandlerInterface $module_handler, array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $container->get('module_handler'),
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritdoc}
   */
  public function run() {
    $this->value = $this->t('installed');

    // Test for the page_cache module, which is required for cache invalidation.
    if (!$this->moduleHandler->moduleExists('page_cache')) {
      $this->value = '';
      $this->recommendation = $this->t("Please install the page_cache module. The page cache acts as a 'second layer of defence' by keeping copies of all generated pages, which protects you from widespread performance degradation in case of emergencies.");
      return self::SEVERITY_WARNING;
    }
    return self::SEVERITY_OK;
  }

}
