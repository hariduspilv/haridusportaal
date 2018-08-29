<?php

namespace Drupal\htm_custom_xjson_services\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_xjson_services\xJsonServiceInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\user\Entity\User;
use GuzzleHttp\Exception\RequestException;
use PhpParser\Node\Expr\AssignOp\Mod;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "xjson_rest_resource",
 *   label = @Translation("X json rest resource"),
 *   uri_paths = {
 *     "https://www.drupal.org/link-relations/create" = "/xjson_service"
 *   }
 * )
 */
class xJsonRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new xJsonRestResource object.
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
    xJsonServiceInterface $xJsonService,
    AccountProxyInterface $current_user) {
			parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
			$this->xJsonService = $xJsonService;
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
      $container->get('logger.factory')->get('htm_custom_xjson_services'),
      $container->get('htm_custom_xjson_services.default'),
      $container->get('current_user')
    );
  }

  /**
   * Responds to POST requests.
   *
   * @param array
   *   The data object.
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
  	#dump($data);
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->isAuthenticated()) {
      throw new AccessDeniedHttpException();
    }
    #dump($data);
    if($data['form_info']){
			$request_body = $this->xJsonService->getBasexJsonForm(false, $data['form_info']);
		}else{
			$request_body = $this->xJsonService->getBasexJsonForm(true);
		}

		if(empty($request_body)) return new ModifiedResourceResponse('form_name unknown', 400);

		$client = \Drupal::httpClient();
		try {
			/*TODO make post URL configurable*/
			$request = $client->post('http://test-htm.wiseman.ee:30080/api/postDocument', [
					'json' => $request_body,
			]);
			$response = json_decode($request->getBody(), TRUE);
			#dump($response);
			$builded_response = $this->xJsonService->buildFormv2($response);

			if(empty($builded_response)) return new ModifiedResourceResponse('Form building failed!', 500);

			return new ModifiedResourceResponse($builded_response, 200);
		}catch (RequestException $e){
			return new ModifiedResourceResponse($e->getMessage(), $e->getCode());
		}
	}
}
