<?php

namespace Drupal\htm_custom_harid_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Jumbojett\OpenIDConnectClient;
use Jumbojett\OpenIDConnectClientException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  public function startAuthentication() {

      $userInfo = $this->getHarIdAuthentication();
      $account = $this->getAccount($userInfo);
      $jwt = $this->getJwt($account);

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

  public function getJwt($account){
    $request_url = $_SERVER['HTTP_HOST'];
    $request_url .= '/api/v1/token?_format=json';

    $params['headers'] = array(
      'Content-Type' => 'application/json'
    );

    kint($account);
    die();

    $params['body'] = json_encode(array(
      'first_name' => $account->getAccountName(),
      'last_name' => $account->getPassword()
    ));

    $client = \Drupal::httpClient();
    try{
      $response = $client->post($request_url, $params);
    }catch(HttpException $e){
      $message = t('Unable to authenticate user.');
      throw new HttpException(500, $message);
    }
    $response = $client->post($request_url, $params);
    $response_body = $response->getBody();
    $response_data = json_decode($response_body->getContents());
    if($response_data->message === 'Login succeeded'){
      $token = $response_data->token;
      return $token;
    }else{
      $message = t('Unable to authenticate user.');
      throw new HttpException(500, $message);
    }
  }

  public function getHarIdAuthentication(){
    $oidc = new OpenIDConnectClient('https://test.harid.ee', '0855cd5d8e5418a5e8c3dd3187dd0a6f', 'f75da21ad0d015fb71dba9895204429e57c7c9fa375779c00ae055cefcf9feac');
    #$oidc->providerConfigParam(array('token_endpoint' => 'https://test.harid.ee/et/access_tokens'));
    $oidc->addScope('personal_code');
    $oidc->addScope('openid');
    try{
      $oidc->authenticate();
    }catch(OpenIDConnectClientException $e){
      $message = t('Unable to authenticate user.');
      throw new HttpException(500, $message);
    }
    $userInfo = $oidc->requestUserInfo('personal_code');
    return $userInfo;
  }

  public function getAccount($userInfo){
    list($country,$type,$id_code) = explode(':', $userInfo);
    $users = \Drupal::entityTypeManager()->getStorage('user')->loadByProperties(['field_user_idcode' => $id_code]);
    if(empty($users)){
      $values = array(
        'name' => user_password(20),
        'pass' => user_password(50),
        'field_user_idcode' => $id_code,
        'status' => 1,
      );
      $account = entity_create('user', $values);
      $account->save();
    }else{
      $account = reset($users);
    }
    if(isset($account)){
      return $account;
    }else{
      $message = t('Unable to authenticate user.');
      throw new HttpException(500, $message);
    }
  }

}
