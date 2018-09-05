<?php

namespace Drupal\htm_custom_harid_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Jumbojett\OpenIDConnectClient;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  public function startAuthentication() {
    $oidc = new OpenIDConnectClient('https://test.harid.ee', '0855cd5d8e5418a5e8c3dd3187dd0a6f', 'f75da21ad0d015fb71dba9895204429e57c7c9fa375779c00ae055cefcf9feac');
    $oidc->setVerifyHost(false);
    $oidc->setVerifyPeer(false);
    $oidc->setResponseTypes(array('code','token','id_token','code token', 'code id_token', 'id_token token', 'code id_token token'));
    $oidc->authenticate();
    $name = $oidc->requestUserInfo('name');
    dump('jou');
    die();

  }

}
