<?php

namespace Drupal\htm_custom_ehis_connector\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\htm_custom_ehis_connector\SecondaryEhisConnectorService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "secondary_ehis_service_rest_resource",
 *   label = @Translation("Secondary EHIS service rest resource"),
 *   uri_paths = {
 *     "canonical" = "/ehis/{service_name}/{v1}/{v2}/{v3}/{v4}/{v5}/{v6}/{v7}/{v8}/{v9}"
 *   }
 * )
 */
class SecondaryEhisInterceptor extends ResourceBase {


	/**
	 * Secondary Ehis connector service
	 *
	 * @var SecondaryEhisConnectorService
	 */
	protected $certificate;
  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;


	/**
	 * ProfessionalCertificateRestResource constructor.
	 *
	 * @param array                 $configuration
	 * @param                       $plugin_id
	 * @param                       $plugin_definition
	 * @param array                 $serializer_formats
	 * @param LoggerInterface       $logger
	 * @param AccountProxyInterface $current_user
	 * @param EhisConnectorService  $ehisConnectorService
	 */
	public function __construct(
			array $configuration,
			$plugin_id,
			$plugin_definition,
			array $serializer_formats,
			LoggerInterface $logger,
			AccountProxyInterface $current_user,
			EhisConnectorService $ehisConnectorService) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
		$this->certificate = $ehisConnectorService;
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
      $container->get('logger.factory')->get('htm_custom_professional_certific'),
      $container->get('current_user'),
			$container->get('htm_custom_ehis_connector.default')
    );
  }


	/**
	 *
	 * Responds to GET requests.
	 *
	 * @param $service_name
	 *   The service key
	 *
	 * @throws \Symfony\Component\HttpKernel\Exception\HttpException
	 *   Throws exception expected.
	 *
	 * @return ResourceResponse
	 */
	public function get(Request $request, $service_name) {
		// You must to implement the logic of your REST Resource here.
		// Use current user after pass authentication to validate access.
		if (!$this->currentUser->hasPermission('access content')) {
			throw new AccessDeniedHttpException();
		}

		dump($request);
		dump($service_name);

/*		try{
			$json = $this->certificate->{$method}($params);
		}catch (RequestException $e){
			return new ResourceResponse($e->getMessage(), $e->getCode());
		}

    $response = new ModifiedResourceResponse($json, 200);*/
    $response = new ModifiedResourceResponse('', 200);

		return $response;
	}

}
