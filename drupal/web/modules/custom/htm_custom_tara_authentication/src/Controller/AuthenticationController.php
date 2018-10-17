<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Jumbojett\OpenIDConnectClient;
use Jumbojett\OpenIDConnectClientException;
use Drupal\Core\Site\Settings;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  public function startAuthentication() {
      $tara_secret = settings::get('tara_secret');

      $oidc = new OpenIDConnectClient('https://tara-test.ria.ee', 'eduportaal', $tara_secret);
      $oidc->providerConfigParam(
      	[
      		'authorization_endpoint' => 'https://tara-test.ria.ee/oidc/authorize',
	      ]);
      $oidc->addScope('openid');
      $oidc->setResponseTypes(array('code'));
      try{
          $oidc->authenticate();
      }catch(OpenIDConnectClientException $e){
          return new \Exception($e->getCode(), $e->getMessage());
      }
      $userInfo = $oidc->requestUserInfo();
      kint($oidc);
      kint($userInfo);
      die();
  }

}
