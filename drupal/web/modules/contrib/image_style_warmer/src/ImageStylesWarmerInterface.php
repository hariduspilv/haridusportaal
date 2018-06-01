<?php

namespace Drupal\image_style_warmer;

use Drupal\file\FileInterface;

/**
 * Provides an interface defining an image styles warmer.
 */
interface ImageStylesWarmerInterface {

  /**
   * Warm up of images style from a file.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file for which image styles should be created.
   */
  public function warmUp(FileInterface $file);

  /**
   * Initial warm up of images style from a file.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file for which image styles should be created.
   */
  public function initialWarmUp(FileInterface $file);

  /**
   * Queue warm up of images style from a file.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file for which image styles should be created.
   */
  public function queueWarmUp(FileInterface $file);

  /**
   * Add file to ImageStylesPregenerator queue.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file for which image styles should be created.
   */
  public function addQueue(FileInterface $file);

  /**
   * Validate file as an image file.
   *
   * @param \Drupal\file\FileInterface $file
   *   The file for which image styles should be created.
   */
  public function validateImage(FileInterface $file);

}
