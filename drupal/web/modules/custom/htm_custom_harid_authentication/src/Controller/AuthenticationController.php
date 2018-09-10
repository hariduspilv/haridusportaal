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
    $oidc->setResponseTypes(array('code'));
    $oidc->addScope(array('personal_code'));
    $oidc->setAllowImplicitFlow(true);
    $oidc->addAuthParam(array('response_mode' => 'form_post'));
    $oidc->authenticate();
    $sub[] = $oidc->getVerifiedClaims('sub');
    $sub[] = $oidc->getVerifiedClaims('iss');
    $sub[] = $oidc->getVerifiedClaims('name');
    $sub[] = $oidc->getVerifiedClaims('email');
    $sub[] = $oidc->getVerifiedClaims('phone_number');
    $sub[] = $oidc->getVerifiedClaims('personal_code');
    $sub[] = $oidc->getVerifiedClaims('roles');
    kint($sub);
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
