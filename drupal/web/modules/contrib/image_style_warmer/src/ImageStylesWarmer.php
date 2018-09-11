<?php

namespace Drupal\image_style_warmer;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\file\FileInterface;
use Drupal\Core\Image\ImageFactory;

/**
 * Defines an images styles warmer.
 */
class ImageStylesWarmer implements ImageStylesWarmerInterface {

  /**
   * Config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $config;

  /**
   * The file entity storage.
   *
   * @var \Drupal\file\FileStorageInterface
   */
  protected $file;

  /**
   * The image factory.
   *
   * @var \Drupal\Core\Image\ImageFactory
   */
  protected $image;

  /**
   * The image style entity storage.
   *
   * @var \Drupal\image\ImageStyleStorageInterface
   */
  protected $imageStyles;

  /**
   * Constructs a ImageStylesWarmer object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Entity\EntityTypeManager $file_storage
   *   The file storage.
   * @param \Drupal\Core\Image\ImageFactory $image_factory
   *   The image factory.
   * @param \Drupal\Core\Entity\EntityTypeManager $image_style_storage
   *   The image style storage.
   */
  public function __construct(ConfigFactoryInterface $config_factory, EntityTypeManager $file_storage, ImageFactory $image_factory, EntityTypeManager $image_style_storage) {
    $this->config = $config_factory->get('image_style_warmer.settings');
    $this->file = $file_storage->getStorage('file');
    $this->image = $image_factory;
    $this->imageStyles = $image_style_storage->getStorage('image_style');
  }

  /**
   * {@inheritdoc}
   */
  public function warmUp(FileInterface $file) {
    $this->initialWarmUp($file);
    $this->addQueue($file);
  }

  /**
   * {@inheritdoc}
   */
  public function initialWarmUp(FileInterface $file) {

    /* @var \Drupal\Core\Image\Image $image */
    /* @var \Drupal\image\Entity\ImageStyle $style */

    $initialImageStyles = $this->config->get('upload_image_styles');
    if (!empty($initialImageStyles) && $this->validateImage($file)) {

      $image_uri = $file->getFileUri();

      // Create image derivatives if they not already exists.
      $styles = $this->imageStyles->loadMultiple(array_keys($initialImageStyles));
      foreach ($styles as $style) {
        $derivative_uri = $style->buildUri($image_uri);
        if (!file_exists($derivative_uri)) {
          $style->createDerivative($image_uri, $derivative_uri);
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function queueWarmUp(FileInterface $file) {

    /* @var \Drupal\Core\Image\Image $image */
    /* @var \Drupal\image\Entity\ImageStyle $style */

    $queueImageStyles = $this->config->get('queue_image_styles');
    if (!empty($queueImageStyles) && $this->validateImage($file)) {

      $image_uri = $file->getFileUri();

      // Create image derivatives if they not already exists.
      $styles = $this->imageStyles->loadMultiple(array_keys($queueImageStyles));
      foreach ($styles as $style) {
        $derivative_uri = $style->buildUri($image_uri);
        if (!file_exists($derivative_uri)) {
          $style->createDerivative($image_uri, $derivative_uri);
        }
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function addQueue(FileInterface $file) {
    $queueImageStyles = $this->config->get('queue_image_styles');
    if (!empty($queueImageStyles) && $this->validateImage($file)) {
      $queue = \Drupal::queue('image_style_warmer_pregenerator');
      $data = ['file_id' => $file->id()];
      $queue->createItem($data);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function validateImage(FileInterface $file) {
    if ($file->isPermanent()) {
      $image = $this->image->get($file->getFileUri());
      if ($image->isValid()) {
        return TRUE;
      }
    }
    return FALSE;
  }
}
