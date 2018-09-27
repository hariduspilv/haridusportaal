<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Jumbojett\OpenIDConnectClient;
use Jumbojett\OpenIDConnectClientException;
use Drupal\Core\Site\Settings;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  public function startAuthentication() {
      $tara_secret = settings::get('tara_secret');

      $oidc = new OpenIDConnectClient('https://tara.ria.ee', 'eduportaal', $tara_secret);
      kint($oidc);
      die();
  }

}
