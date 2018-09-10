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
    $oidc->providerConfigParam(array('token_endpoint' => 'https://test.harid.ee/et/access_tokens'));
    $oidc->addScope('personal_code');
    $oidc->authenticate();
    list($country,$type,$id_code) = explode(':', $oidc->requestUserInfo('personal_code'));
    kint($id_code);
    die();
    #$actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    #kint($actual_link);
    #die();
    #$oidc->providerConfigParam(array('token_endpoint'=>'https://test.harid.ee/et/access_tokens'));
    #$oidc->addScope('personal_code');
    #$clientCredentialsToken = $oidc->requestClientCredentialsToken()->acces_token;
    #dump($clientCredentialsToken);
    #die();

  }

}
