<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  public function startAuthentication() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Implement method: startAuthentication')
    ];
  }

}
