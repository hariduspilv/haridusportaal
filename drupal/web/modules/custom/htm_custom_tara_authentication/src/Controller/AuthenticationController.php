<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Jumbojett\OpenIDConnectClientException;
use Drupal\htm_custom_authentication\OpenIDConnectClientCustom;
use Drupal\Core\Site\Settings;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  public function startAuthentication() {
	header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
	header("Cache-Control: post-check=0, pre-check=0", false);
	header("Pragma: no-cache");
		
	$tara_secret = settings::get('tara_secret');


	$oidc = new OpenIDConnectClientCustom('https://tara-test.ria.ee/oidc', 'eduportaal', $tara_secret);
	try{
		$oidc->authenticate();
		dump($oidc->requestUserInfo());
		dump($oidc->getTokenResponse());
		dump($oidc->getAccessToken());
		dump($oidc->getVerifiedClaims('sub'));
		dump($oidc->getVerifiedClaims('profile_attributes'));
	}catch (OpenIDConnectClientException $e){
		return new OpenIDConnectClientException($e);
	}
	  return [];
  }

}
