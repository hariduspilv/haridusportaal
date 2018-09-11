<?php

namespace Drupal\purge_queuer_url\Plugin\Purge\DiagnosticCheck;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckBase;
use Drupal\purge_queuer_url\TrafficRegistryInterface;

/**
 * Tests if the URL queuer's traffic registry is in a healthy shape.
 *
 * @PurgeDiagnosticCheck(
 *   id = "purge_queuer_url_registry",
 *   title = @Translation("Traffic registry"),
 *   description = @Translation("Tests if the URL queuer's traffic registry is in a healthy shape."),
 *   dependent_queue_plugins = {},
 *   dependent_purger_plugins = {}
 * )
 */
class RegistryCheck extends DiagnosticCheckBase implements DiagnosticCheckInterface {

  /**
   * The traffic registry with the stored URLs and tags.
   *
   * @var \Drupal\purge_queuer_url\TrafficRegistryInterface
   */
  protected $registry;

  /**
   * Constructs a \Drupal\purge_queuer_url\Plugin\Purge\DiagnosticCheck\RegistryCheck object.
   *
   * @param \Drupal\purge_queuer_url\TrafficRegistryInterface $registry
   *   The traffic registry with the stored URLs and tags.
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(TrafficRegistryInterface $registry, array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->registry = $registry;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $container->get('purge_queuer_url.registry'),
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * {@inheritdoc}
   */
  public function run() {
    $this->value = $this->registry->countUrls();
    if ($this->value < 50) {
      $this->recommendation = $this->t("You need to spider your site to be able to queue URLs or paths, for example run: 'wget -r -nd --delete-after -l100 --spider http://site/'.");
      return SELF::SEVERITY_WARNING;
    }
    elseif ($this->value > 7000) {
      $this->recommendation = $this->t("Your traffic database is huge, please consider tag based invalidation before your site becomes VERY slow!");
      return SELF::SEVERITY_WARNING;
    }
    $this->recommendation = ' ';
    return SELF::SEVERITY_OK;
  }

}
