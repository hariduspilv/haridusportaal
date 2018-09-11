<?php

namespace Drupal\htm_custom_harid_authentication\Controller;

use Drupal\Core\Controller\ControllerBase;
use Jumbojett\OpenIDConnectClient;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Flood\FloodInterface;
use Drupal\custom_mobile_id_authentication\UserAuthInterface;

/**
 * Class AuthenticationController.
 */
class AuthenticationController extends ControllerBase {

  /**
  * The config factory.
  *
  * @var \Drupal\Core\Config\ConfigFactoryInterface
  */
  protected $configFactory;
  /**
  * The user auth service.
  *
  * @var \Drupal\custom_mobile_id_authentication\UserAuthInterface
  */
  protected $userAuth;
  /**
  * The flood service.
  *
  * @var \Drupal\Core\Flood\FloodInterface
  */
  protected $flood;
  /**
  * The entity type manager.
  *
  * @var \Drupal\Core\Entity\EntityTypeManagerInterface
  */
  protected $entityManager;
  /**
  * Constructs a HTTP basic authentication provider object.
  *
  * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
  *   The config factory.
  * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
  *   The entity type manager service.
  */
  public function __construct(ConfigFactoryInterface $config_factory, UserAuthInterface $user_auth, FloodInterface $flood, EntityTypeManagerInterface $entity_manager) {
    $this->configFactory = $config_factory;
    $this->userAuth = $user_auth;
    $this->flood = $flood;
    $this->entityManager = $entity_manager;
  }

  public function startAuthentication() {
    $flood_config = $this->configFactory->get('user.flood');

    if ($this->flood->isAllowed('json_authentication_provider.failed_login_ip', $flood_config->get('ip_limit'), $flood_config->get('ip_window'))) {
      $oidc = new OpenIDConnectClient('https://test.harid.ee', '0855cd5d8e5418a5e8c3dd3187dd0a6f', 'f75da21ad0d015fb71dba9895204429e57c7c9fa375779c00ae055cefcf9feac');
      #$oidc->providerConfigParam(array('token_endpoint' => 'https://test.harid.ee/et/access_tokens'));
      $oidc->addScope('personal_code');
      $oidc->authenticate();
      $userInfo = $oidc->requestUserInfo('personal_code');
      if($userInfo != NULL){
        list($country,$type,$id_code) = explode(':', $oidc->requestUserInfo('personal_code'));
        kint($id_code);
      }
    }
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
