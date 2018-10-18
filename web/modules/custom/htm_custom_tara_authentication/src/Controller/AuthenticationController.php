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
	dump('jehu');
	die();
	 $tara_secret = settings::get('tara_secret');
      $oidc = new OpenIDConnectClient('https://tara-test.ria.ee', 'eduportaal', $tara_secret);
     	$oidc->providerConfigParam(
      	[
      		'authorization_endpoint' => 'https://tara-test.ria.ee/oidc/authorize',
		#'token_endpoint' => 'https://tara-test.ria.ee/oidc/token'
	      ]);
      $oidc->addScope('openid');
	#$oidc->addScope('redirect_uri');
	#$oidc->addScope('state');

	#$clientToken = $oidc->requestClientCredentialsToken()->access_token;
	#dump($clientToken);
	$oidc->setResponseTypes(['code']);
	$oidc->authenticate();
die();
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
