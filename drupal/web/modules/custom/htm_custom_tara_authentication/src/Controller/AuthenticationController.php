<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
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
      $random_hash = bin2hex(mcrypt_create_iv(16, MCRYPT_DEV_URANDOM));

      $oidc = new OpenIDConnectClient('https://tara.ria.ee', 'eduportaal', $tara_secret);
      $oidc->addScope('openid');
      $oidc->setResponseTypes(array('code'));
      $oidc->$this->setState($random_hash);
      kint($oidc);
      die();
      try{
          $oidc->authenticate();
      }catch(OpenIDConnectClientException $e){
          kint($e);
          die();
          $message = t('Unable to authenticate user.');
          throw new HttpException(500, $message);
      }
      $userInfo = $oidc->requestUserInfo();
      kint($oidc);
      kint($userInfo);
      die();
  }

}
