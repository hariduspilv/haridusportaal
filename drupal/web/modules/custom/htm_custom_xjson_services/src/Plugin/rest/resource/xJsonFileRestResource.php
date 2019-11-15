<?php

namespace Drupal\htm_custom_xjson_services\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\Base64Image;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\htm_custom_xjson_services\xJsonService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Hshn\Base64EncodedFile\HttpFoundation\File\Base64EncodedFile;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "x_json_file_rest_resource",
 *   label = @Translation("X json file rest resource"),
 *   uri_paths = {
 *     "canonical" = "/xjson_service/documentFile/{file_id}",
 *     "create" = "/xjson_service/documentFile"
 *   }
 * )
 */
class xJsonFileRestResource extends ResourceBase {

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
  public function get($file_id) {
    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }

    $file_obj = $this->ehisService->getDocumentFile(['file_id' => $file_id]);
		if($file_obj && $file_obj['fileName'] && $file_obj['value']){
			$sym_file = new Base64EncodedFile($file_obj['value']);
			$response = new BinaryFileResponse($sym_file->getRealPath());
			$response->setContentDisposition(
					ResponseHeaderBag::DISPOSITION_ATTACHMENT,
					$file_obj['fileName']
			);
			return $response;
		}else{
			return new ModifiedResourceResponse('File not found', 400);
		}
  }

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
  public function post($data) {
		// You must to implement the logic of your REST Resource here.
		// Use current user after pass authentication to validate access.
		if (!$this->currentUser->hasPermission('access content')) {
			throw new AccessDeniedHttpException();
		}

  	$requiredDataParams = ['form_name', 'data_element', 'file'];
  	foreach($requiredDataParams as $param){
  		if(!in_array($param, array_keys($data)) || empty($data[$param]))
  			return new ModifiedResourceResponse($this->t('Param: @param_name missing or empty', [
					'@param_name' => $param,
				]));
		}
		$element_extensions = $this->getFileElementExtensions($data);
		if(is_array($data['file'])){
			foreach($data['file'] as $file){
				$img[] = new Base64Image($file, $element_extensions);
				if(!$this->ehisService->saveFileToRedis($img, 'VPT_documents')){
					return new ModifiedResourceResponse('Failed to save', 400);
				}
			}
		}else{
			$img = new Base64Image($data['file'], $element_extensions);
			if(!$this->ehisService->saveFileToRedis($img, 'VPT_documents')){
				return new ModifiedResourceResponse('Failed to save', 400);
			}
		}

		$return = [];
    if(is_array($img)){
    	foreach($img as $item){
    		$return[] = [
					'mime_type' => $item->getMimeType(),
					'id'=> $item->getFileIdentifier(),
					'file_name' => $item->getFileName()
				];
			}
			return new ModifiedResourceResponse($return);
		}else{
			return new ModifiedResourceResponse(
					[
							'mime_type' => $img->getMimeType(),
							'id'=> $img->getFileIdentifier(),
							'file_name' => $img->getFileName()
					], 200);
		}

	}

  protected function getFileElementExtensions($data){
		$defElement = $this->xJsonService->searchDefinitionElement($data['data_element'],NULL,  $data['form_name']);
		if(empty($defElement)) return new ModifiedResourceResponse('data_element not found', 400);
		if(count($defElement) > 1){
			/*@TODO mby we need to do something with them aswel*/
			throw new HttpException('400', 'Found multiple elements');
		}else{
			$defElement = reset($defElement);
		}
		if($defElement['type'] != 'file'){
			throw new HttpException('400','Found data_element type is not file');
		}else{
			return $defElement['acceptable_extensions'];
		}
	}


}
