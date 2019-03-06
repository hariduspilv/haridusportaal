<?php

namespace Drupal\content_sync\Normalizer;

use Drupal\content_sync\Plugin\SyncNormalizerDecoratorManager;
use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\File\FileSystemInterface;

/**
 * Adds the file URI to embedded file entities.
 */
class FileEntityNormalizer extends ContentEntityNormalizer {

  /**
   * The interface or class that this Normalizer supports.
   *
   * @var string
   */
  protected $supportedInterfaceOrClass = 'Drupal\file\FileInterface';

  /**
   * File system service.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  /**
   * FileEntityNormalizer constructor.
   *
   * @param EntityManagerInterface $entity_manager
   *
   * @param SyncNormalizerDecoratorManager $decorator_manager
   *
   * @param FileSystemInterface $file_system
   */
  public function __construct(EntityManagerInterface $entity_manager, SyncNormalizerDecoratorManager $decorator_manager, FileSystemInterface $file_system) {
    parent::__construct($entity_manager, $decorator_manager);
    $this->fileSystem = $file_system;
  }

  /**
   * {@inheritdoc}
   */
  public function denormalize($data, $class, $format = NULL, array $context = array()) {

    $file_data = '';

    // Check if the image is available as base64-encoded image.
    if (!empty($data['data'][0]['value'])) {
      $file_data = $data['data'][0]['value'];
      // Avoid 'data' being treated as a field.
      unset($data['data']);
    }

    // If a directory is set, we must to copy the file to the file system.
    if (!empty($context['content_sync_directory'])) {
      $scheme = $this->fileSystem->uriScheme($data['uri'][0]['value']);
      if (!empty($scheme)) {
        $source_path = realpath($context['content_sync_directory']) . '/files/' . $scheme . '/';
        $source      = str_replace($scheme . '://', $source_path, $data['uri'][0]['value']);
        if (file_exists($source)) {
          $file = $this->fileSystem->realpath($data['uri'][0]['value']);
          if (!file_exists($file) || (md5_file($file) !== md5_file($source))) {
            $dir = $this->fileSystem->dirname($data['uri'][0]['value']);
            file_prepare_directory($dir, FILE_CREATE_DIRECTORY);
            $uri = file_unmanaged_copy($source, $data['uri'][0]['value']);
            $data['uri'] = [
              [
                'value' => $uri,
                'url' => str_replace($GLOBALS['base_url'], '', file_create_url($uri))
              ]
            ];

            // We just need a method to create the image.
            $file_data = '';
          }
        }
      }
    }

    $entity = parent::denormalize($data, $class, $format, $context);

    // If the image was sent as base64 we must to create the physical file.
    if ($file_data) {
      // Decode and save to file.
      $file_contents = base64_decode($file_data);
      $dirname = $this->fileSystem->dirname($entity->getFileUri());
      file_prepare_directory($dirname, FILE_CREATE_DIRECTORY);
      if ($uri = file_unmanaged_save_data($file_contents, $entity->getFileUri())) {
        $entity->setFileUri($uri);
      }
      else {
        throw new \RuntimeException(SafeMarkup::format('Failed to write @filename.', array('@filename' => $entity->getFilename())));
      }
    }

    // If the image was sent as URL we must to create the physical file.
    if ($file_data) {
      // Decode and save to file.
      $file_contents = base64_decode($file_data);
      $dirname = $this->fileSystem->dirname($entity->getFileUri());
      file_prepare_directory($dirname, FILE_CREATE_DIRECTORY);
      if ($uri = file_unmanaged_save_data($file_contents, $entity->getFileUri())) {
        $entity->setFileUri($uri);
      }
      else {
        throw new \RuntimeException(SafeMarkup::format('Failed to write @filename.', array('@filename' => $entity->getFilename())));
      }
    }

    return $entity;
  }

  /**
   * {@inheritdoc}
   */
  public function normalize($object, $format = NULL, array $context = array()) {
    $data = parent::normalize($object, $format, $context);

    // The image will be saved in the export directory.
    if (!empty($context['content_sync_directory'])) {
      $uri = $object->getFileUri();
      $scheme = $this->fileSystem->uriScheme($uri);

      $destination = "{$context['content_sync_directory']}/files/{$scheme}/";
      $destination = str_replace($scheme . '://', $destination, $uri);
      file_prepare_directory($this->fileSystem->dirname($destination), FILE_CREATE_DIRECTORY);
      file_unmanaged_copy($uri, $destination, FILE_EXISTS_REPLACE);
    }

    // Set base64-encoded file contents to the "data" property.
    if (!empty($context['content_sync_file_base_64'])) {
      $file_data = base64_encode(file_get_contents($object->getFileUri()));
      $data['data'] = [['value' => $file_data]];
    }

    return $data;
  }

}
