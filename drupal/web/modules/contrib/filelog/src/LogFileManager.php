<?php

namespace Drupal\filelog;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\File\FileSystemInterface;

/**
 * Provide file-handling methods for the logfile.
 *
 * This is a separate service to allow it to be injected into the logger as a
 * proxy and circumvent the circular dependency between logger and file system.
 */
class LogFileManager implements LogFileManagerInterface {

  /**
   * The filelog settings.
   *
   * @var \Drupal\Core\Config\Config
   */
  protected $config;

  /**
   * The file system service.
   *
   * @var \Drupal\Core\File\FileSystemInterface
   */
  protected $fileSystem;

  /**
   * LogFileManager constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The config_factory service.
   * @param \Drupal\Core\File\FileSystemInterface $fileSystem
   *   The file_system service.
   */
  public function __construct(ConfigFactoryInterface $configFactory, FileSystemInterface $fileSystem) {
    $this->config = $configFactory->get('filelog.settings');
    $this->fileSystem = $fileSystem;
  }

  /**
   * {@inheritdoc}
   */
  public function ensurePath(): bool {
    $path = $this->config->get('location');
    return $this->fileSystem->prepareDirectory($path, FileSystemInterface::CREATE_DIRECTORY);
  }

}
