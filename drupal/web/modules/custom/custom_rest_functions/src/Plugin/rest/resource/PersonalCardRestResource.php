<?php

namespace Drupal\custom_rest_functions\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "personal_card_rest_resource",
 *   label = @Translation("Personal card rest resource"),
 *   uri_paths = {
 *   	 "create" = "/personal-card"
 *   }
 * )
 */
class PersonalCardRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new PersonalCardRestResource object.
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
      $container->get('logger.factory')->get('custom_rest_functions'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to GET requests.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  /*public function get(array $data) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
		dump($entity);
    return new ResourceResponse($entity, 200);
  }*/

  /**
   * Responds to POST requests.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity object.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post(array $data) {
  	$api_endpoint = 'http://api-htm.wiseman.ee:30080/api/';

		if (!$this->currentUser->hasPermission('access content')) {
			throw new AccessDeniedHttpException();
		}

  	if(!empty($data['idCode'])){
			$url = $api_endpoint . 'eeIsikukaart/' . $data['idCode'];
			$client = \Drupal::httpClient();
			$request = $client->get($url);
			$return = array();
			$response = json_decode($request->getBody());
			if(!empty($response->uuidString) && $response->status === 'PENDING'){
				$uuid = $response->uuidString;
				$url_uuid = $api_endpoint . 'response/' . $uuid;
				$count = 0;
				while (TRUE) {
					sleep(2);
					$count++;
					$request_uuid = $client->get($url_uuid);
					//print_r(json_decode($request_uuid->getBody(), TRUE));
					$response_uuid = json_decode($request_uuid->getBody(), TRUE);
					//dump($response_uuid);
					if($response_uuid['status'] === 'OK' && empty($response_uuid['error'])){
						$return = $response_uuid;
						break;
					}elseif($response_uuid['status'] === 'OK' && !empty($response_uuid['error']	)){
						$return = $response_uuid;
						break;
					}
				}
			}
			//print_r(json_decode(json_encode($return), TRUE));
			return new ModifiedResourceResponse($return, 200);
			//return new ModifiedResourceResponse(json_decode(json_encode($return), TRUE), 200);
		}else{
			return new ModifiedResourceResponse('idCode param missing', 400);
		}

  }

}
