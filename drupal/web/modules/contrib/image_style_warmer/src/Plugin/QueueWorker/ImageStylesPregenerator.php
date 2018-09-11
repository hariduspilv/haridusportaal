<?php

namespace Drupal\image_style_warmer\Plugin\QueueWorker;

use Drupal\Core\Config\Config;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Queue\QueueWorkerBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Executes interface image styles pregeneration queue tasks.
 *
 * @QueueWorker(
 *   id = "image_style_warmer_pregenerator",
 *   title = @Translation("Pregenerate image styles"),
 *   cron = {"time" = 60}
 * )
 */
class ImageStylesPregenerator extends QueueWorkerBase implements ContainerFactoryPluginInterface {

  /**
   * The image style warmer settings.
   *
   * @var \Drupal\Core\Config\Config
   */
  protected $config;

  /**
   * The file entity storage.
   *
   * @var \Drupal\file\FileStorageInterface
   */
  protected $fileStorage;

  /**
   * Constructs a new ImageStylePregenerator object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param array $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\Config $image_style_warmer_settings
   *   The image style warmer settings.
   * @param \Drupal\Core\Entity\EntityStorageInterface $file_storage
   *   The file storage.
   */
  public function __construct(array $configuration, $plugin_id, array $plugin_definition, Config $image_style_warmer_settings, EntityStorageInterface $file_storage) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->config = $image_style_warmer_settings;
    $this->fileStorage = $file_storage;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory')->get('image_style_warmer.settings'),
      $container->get('entity_type.manager')->getStorage('file')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function processItem($data) {
    $file_id = $data['file_id'];
    $queueImageStyles = $this->config->get('queue_image_styles');
    if (!empty($queueImageStyles) && $file = $this->fileStorage->load($file_id)) {
      \Drupal::service('image_style_warmer.warmer')->queueWarmUp($file);
    }
  }

}
