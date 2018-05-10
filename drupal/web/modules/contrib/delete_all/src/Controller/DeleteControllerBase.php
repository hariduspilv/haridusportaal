<?php

/**
 * @file
 * Contains \Drupal\delete_all\Controller\DeleteControllerBase.
 */

namespace Drupal\delete_all\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Returns responses for devel module routes.
 */
abstract class DeleteControllerBase extends ControllerBase {

  protected $connection;

  public function __construct() {
    $this->connection = \Drupal::database();
  }
}
