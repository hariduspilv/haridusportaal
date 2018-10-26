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
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
		
	$tara_secret = settings::get('tara_secret');


	$oidc = new OpenIDConnectClient('https://tara-test.ria.ee/oidc', 'eduportaal', $tara_secret);
     	/*$oidc->providerConfigParam(
      	[
      		#'authorization_endpoint' => 'https://tara-test.ria.ee/oidc/authorize',
		#'token_endpoint' => 'https://tara-test.ria.ee/oidc/token',
		#'jwks_uri' => 'https://tara-test.ria.ee/oidc/jwks',
	]);*/
	#$oidc->setResponseTypes(array('id_token'));
	#dump($_REQUEST);
	#$oidc->setAllowImplicitFlow(TRUE);
     	#$oidc->addScope('openid');
	#$oidc->addAuthParam(['username' => 'eduportaal']);
	#$oidc->addAuthParam(['password' => $tara_secret]);
	#$clientCredentialsToken = $oidc->requestClientCredentialsToken()->access_token;
	#dump($clientCredentialsToken);
	#$oidc->setCertPath('./sites/default/files/public.key');
	
	$oidc->authenticate();
	
	dump($oidc->getTokenResponse());
	dump($oidc->getAccessToken());
	dump($oidc->getVerifiedClaims('sub'));
	dump($oidc->getVerifiedClaims('profile_attributes'));


	return [];

      $oidc->setResponseTypes(array('code'));
	dump($_REQUEST);
	dump($_SESSION);
      try{
          $oidc->authenticate();
      }catch(OpenIDConnectClientException $e){
		#dump('jee');
          throw new HttpException(500, $e->getMessage());
      }
      $userInfo = $oidc->requestUserInfo();
      kint($oidc);
      kint($userInfo);
      die();
  }

}
