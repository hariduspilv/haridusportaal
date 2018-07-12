<?php

namespace Drupal\custom_mobile_id_authentication\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

use Drupal\custom_mobile_id_authentication\Plugin\DigiDocService;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "mobile_id_rest_resource",
 *   label = @Translation("Mobile id rest resource"),
 *   uri_paths = {
 *     "https://www.drupal.org/link-relations/create" = "/custom/login/mobile_id"
 *   }
 * )
 */
class MobileIdRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new MobileIdRestResource object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param array $serializer_formats
   *   The available serialization formats.
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   * @param \Drupal\Core\Session\AccountProxyInterface $current_user
   *   A current user instance.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->getParameter('serializer.formats'),
      $container->get('logger.factory')->get('custom_mobile_id_authentication'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to POST requests.
   *
   * Returns a list of bundles for specified entity.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    if(isset($data['telno'])){
      $dds = DigiDocService::Instance();
      $data['telno'] = str_replace(' ', '', $data['telno']);
      if (substr($data['telno'], 0, 1) != '+') {
        $data['telno'] = '+372'.$data['telno'];
      }
      if (!empty($data) && $data['telno'] != "") {
        $params = array(
          "CountryCode" => "",
          "PhoneNo" => $data['telno'],
          "Language" => DDS_LANG,
          "ServiceName" => DDS_MID_SERVICE_NAME,
          "MessageToDisplay" => DDS_MID_INTRODUCTION_STRING,
          "SPChallenge" => getToken(10),
          "MessagingMode" => "asynchClientServer",
          "AsyncConfiguration" => NULL,
          "ReturnCertData" => false,
          "ReturnRevocationData" => FALSE
        );
        $result = $dds->MobileAuthenticate($params);
        if(isset($result['Status']) && $result['Status'] === 'OK'){
          $keys = DDS_TELNO_RETURN_FIELDS;
          foreach($keys as $reqfield){
            if(!array_key_exists($reqfield, $result)){
              $message = $this->t('Missing required fields in response.');
              throw new HttpException(400, $message);
            }
          }
          $result = array_intersect_key($result, array_flip($keys));
          return new ResourceResponse($result);
        }else{
          switch ($result['Code']) {
            case 101:
              $message = $this->t('Invalid phone number.');
              break;
            case 104:
              $message = $this->t('Access denied, error authorizing user.');
              break;
            case 301:
              $message = $this->t('User is not a Mobile-ID client.');
              break;
            case 400:
              $message = $this->t('Could not connect to host.');
              break;
            default:
              $message = $result['message'];
              \Drupal::logger('custom_mobile_id_authentication')->error($message);
              throw new HttpException(500, $this->t('Authorizing failed, please try again.'));
          }
          throw new HttpException(400, $message);
        }
      } else {
        throw new HttpException(400, 'Empty mobile number.');
      }
    }
    if(isset($data['Sesscode'])){
      $dds = DigiDocService::Instance();
      if(!empty($data) && $data['Sesscode'] != ""){
        $params = array(
          "Sesscode" => $data['Sesscode'],
          "WaitSignature" => false
        );
        while($result['Status'] != 'USER_AUTHENTICATED'){
          try{
            $result = $dds->GetMobileAuthenticateStatus($params);
          } catch (\Exception $e){
            switch($e->getMessage()){
              case 'SIM_ERROR':
                $message = $this->t('SIM application error.');
                break;
              case 'PHONE_ABSENT':
                $message = $this->t('Phone is not in coverage area.');
                break;
              case 'NOT_VALID':
                $message = $this->t('Mobile-ID certificates are revoked or suspended.');
                break;
              case 'SENDING_ERROR':
                $message = $this->t('Sending authentication request to phone failed.');
                break;
              case 'USER_CANCEL':
                $message = $this->t('Authentication has been canceled.');
                break;
              case 'EXPIRED_TRANSACTION':
                $message = $this->t('Authentication has been expired.');
                break;
              default:
                $message = $e->getMessage();
                \Drupal::logger('tk_custom_auth')->error($message);
                $result = ['Status' => 'error', 'Code' => 500, 'message' => $this->t('Authorizing failed, please try again.')];
                return new ResourceResponse($result);
            }
            $result = ['Status' => 'error', 'Code' => 400, 'message' => $message];
            return new ResourceResponse($result);
          }
        }
        if($result['Status'] === 'USER_AUTHENTICATED'){

        }
        return new ResourceResponse($result);
      }
    }
  }

}
