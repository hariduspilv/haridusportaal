<?php

namespace Drupal\htm_custom_xjson_services\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\htm_custom_xjson_services\xJsonService;
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
 *   id = "x_json_document_rest_resource",
 *   label = @Translation("X json document rest resource"),
 *   uri_paths = {
 *     "canonical" = "/xjson_service/document/{form_name}/{id}"
 *   }
 * )
 */

class xJsonGetDocument extends ResourceBase {
	/**
	 * A current user instance.
	 *
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $currentUser;

	/**
	 * Constructs a new xJsonFileRestResource object.
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
		EhisConnectorService $ehisConnectorService,
		xJsonService $xJsonService,
		AccountProxyInterface $current_user) {
			parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
			$this->ehisService = $ehisConnectorService;
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
			$container->get('htm_custom_ehis_connector.default'),
			$container->get('htm_custom_xjson_services.default'),
			$container->get('current_user')
		);
	}


	/**
	 * @param $form_name
	 * @param $file_id
	 * @return ResourceResponse
	 */
	public function get($form_name, $file_id) {
		// You must to implement the logic of your REST Resource here.
		// Use current user after pass authentication to validate access.
		if (!$this->currentUser->hasPermission('access content')) {
			throw new AccessDeniedHttpException();
		}

		//build params
		$params['url'] = [$form_name, $file_id];
		$response = $this->ehisService->getDocument($params);
		$response['header'] += [
			'endpoint' => 'empty'
		];

		$form_name = $response['header']['form_name'];

		$builded_header = $this->xJsonService->getBasexJsonForm(false, $response, $form_name);
		if(empty($builded_header)) return new ModifiedResourceResponse('Form header build failed', 400);

		$builded_response = $this->xJsonService->buildFormv2($builded_header);
		if(empty($builded_response)) return new ModifiedResourceResponse('Form building failed', 400);

		return new ResourceResponse($builded_response);
	}
}