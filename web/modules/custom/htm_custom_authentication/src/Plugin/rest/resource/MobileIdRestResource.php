<?php

namespace Drupal\htm_custom_authentication\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;

use Drupal\htm_custom_authentication\Plugin\DigiDocService;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "mobile_id_rest_resource",
 *   label = @Translation("Mobile id rest resource"),
 *   uri_paths = {
 *     "create" = "/custom/login/mobile_id"
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
      $container->get('logger.factory')->get('tk_custom_auth'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to POST requests.
   *
   * @param $data
   *   POST data
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
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
          return new ModifiedResourceResponse($result);
        }else{
          switch ($result['Code']) {
            case 101:
              $message = 'login.invalid_number';
              break;
            case 104:
              $message = 'login.access_denied';
              break;
            case 301:
              $message = 'login.not_mobile_id_client';
              break;
            case 400:
              $message = 'login.connection_error';
              break;
            default:
              $message = $result['message'];
              \Drupal::logger('htm_custom_authentication')->error($message);
              throw new HttpException(500, 'login.auth_error');
          }
          throw new HttpException(400, $message);
        }
      } else {
        throw new HttpException(400, 'login.nr_empty');
      }
    }else{
      throw new HttpException(400, 'login.missing_keys');
    }
  }

}
