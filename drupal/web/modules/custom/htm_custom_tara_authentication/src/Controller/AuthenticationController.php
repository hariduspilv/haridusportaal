<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Jumbojett\OpenIDConnectClientException;
use Drupal\htm_custom_authentication\OpenIDConnectClientCustom;
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
	$oidc = new OpenIDConnectClientCustom('https://tara-test.ria.ee/oidc', 'eduportaal', $tara_secret);

	try{
		$oidc->authenticate();

		$userInfo = $oidc->requestUserInfo();
		$id_code = substr($userInfo->principalCode, 2);
		dump($id_code);
		#$external_auth = \Drupal::service('externalauth.externalauth');
		#$token = $external_auth->loginRegister('TARA', $id_code, ['field_user_idcode' => $id_code]);
		#dump($token);
	}catch (OpenIDConnectClientException $e){
		dump($e);
		#return new TrustedRedirectResponse('https://delfi.ee');
		return new HttpException('400', 'jama on');

	}
	  return [];
  }

}
