<?php

namespace Drupal\htm_custom_xjson_services\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\htm_custom_xjson_services\xJsonService;
use Drupal\htm_custom_xjson_services\xJsonFormService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

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
	 * xJsonRestResource constructor.
	 *
	 * @param array                 $configuration
	 * @param                       $plugin_id
	 * @param                       $plugin_definition
	 * @param array                 $serializer_formats
	 * @param LoggerInterface       $logger
	 * @param xJsonService          $xJsonService
     * @param xJsonFormService      $xJsonFormService
	 * @param AccountProxyInterface $current_user
	 * @param EhisConnectorService  $ehisConnectorService
	 */
	public function __construct (
		array $configuration,
		$plugin_id,
		$plugin_definition,
		array $serializer_formats,
		LoggerInterface $logger,
		xJsonService $xJsonService,
		xJsonFormService $xJsonFormService,
		AccountProxyInterface $current_user,
		EhisConnectorService $ehisConnectorService) {
		parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
		$this->xJsonService = $xJsonService;
        $this->xJsonFormService = $xJsonFormService;
		$this->currentUser = $current_user;
		$this->ehisService = $ehisConnectorService;
	}

	/**
	 * {@inheritdoc}
	 */
	public static function create (ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
		return new static(
			$configuration,
			$plugin_id,
			$plugin_definition,
			$container->getParameter('serializer.formats'),
			$container->get('logger.factory')->get('htm_custom_xjson_services'),
			$container->get('htm_custom_xjson_services.default'),
            $container->get('htm_custom_xjson_services.form'),
            $container->get('current_user'),
			$container->get('htm_custom_ehis_connector.default')
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
	public function post ($data) {

        if(isset($data['form_name'])){

            // check whether asked form is xjson entity or xjson form entity
            $xJsonFormEntity = $this->checkxJsonForm($data);

            if($xJsonFormEntity){

                if($this->auth_required){
                    // Use current user after pass authentication to validate access.
                    if (!$this->currentUser->isAuthenticated()) {
                        return new ModifiedResourceResponse("xjson.must_log_in", 403);
                    }
                }

                return isset($data['form_info']) ? $this->postXJsonForm($data) : $this->getXJsonForm($data);

            }else{

                // Use current user after pass authentication to validate access.
                if (!$this->currentUser->isAuthenticated()) {
                    throw new AccessDeniedHttpException();
                }

                if (isset($data['id']) && !isset($data['form_info'])) {
                    if (isset($data['status']) && ($data['status'] === 'draft' || $data['status'] === 'submitted')) {
                        return $this->returnExistingDzeison($data);
                    } else {
                        return new ModifiedResourceResponse('Status missing or status value wrong', 400);
                    }
                }

                if (isset($data['test']) && $data['test'] === true) {
                    return $this->returnTestDzeison();
                } else {
                    return $this->returnRighstDzeison($data);
                }
            }
        }

	}

	private function returnExistingDzeison ($data) {
		$params['url'] = [$data['form_name'], $data['id']];
		$response = $this->ehisService->getDocument($params);
		$response['header'] += [
			'endpoint' => 'empty'
		];
		$form_name = $response['header']['form_name'];
		//validate header activity
		$acceptable_activity = $response['header']['acceptable_activity'];
		#if ($data['status'] === 'draft') $allowed_activites = ['SAVE' => 'SAVE', 'SUBMIT' => 'SUBMIT', 'CONTINUE' => 'CONTINUE'];
		#if ($data['status'] === 'submitted') $allowed_activites = ['VIEW' => 'VIEW'];
		#dump($response);
		#foreach ($acceptable_activity as $value) {
		#	if (!isset($allowed_activites[$value])) {
		#		$errorJson = $this->xJsonService->returnErrorxDzeison();
	 	#		return new ModifiedResourceResponse($errorJson);
		#	}
		#}

		$builded_header = $this->xJsonService->getBasexJsonForm(false, $response, $form_name);
		if (empty($builded_header)) return new ModifiedResourceResponse('form_name unknown', 400);

		return $this->returnBuildedResponse($builded_header);
	}

	private function returnTestDzeison () {
		$response = $this->xJsonService->buildTestResponse();
		return new ModifiedResourceResponse($response);
	}

	private function returnRighstDzeison ($data) {

		if (isset($data['form_info'])) {
			$request_body = $this->xJsonService->getBasexJsonForm(false, $data['form_info']);
		} else {
			$request_body = $this->xJsonService->getBasexJsonForm(true);
		}


		if (empty($request_body)) return new ModifiedResourceResponse('form_name unknown', 400);
		$response = $this->ehisService->postDocument(['json' => $request_body]);
		dump('test');
		return $this->returnBuildedResponse($response);
	}

	private function returnBuildedResponse ($response) {
		$builded_response = $this->xJsonService->buildFormv2($response);
		if (empty($builded_response)) return new ModifiedResourceResponse('Form building failed!', 500);
		return new ModifiedResourceResponse($builded_response, 200);
	}

    private function getXJsonForm ($data) {
	    $definition = $this->xJsonFormService->getXJsonFormDefinition($data);
        return ($definition) ? new ModifiedResourceResponse($definition, 200) : new ModifiedResourceResponse('form_name unknown', 400);
    }

    private function postXJsonForm ($data) {
	    $result = $this->xJsonFormService->postXJsonFormValues($data);
        return new ModifiedResourceResponse($result['form_info'], 200);
	}

    private function checkxJsonForm ($data) {
        $id = $data['form_name'];
        $entityStorage = \Drupal::entityTypeManager()->getStorage('x_json_form_entity');

        $connection = \Drupal::database();
        $xJsonFormQuery = $connection->query("SELECT id FROM x_json_form_entity WHERE xjson_definition->'header'->>'form_name' = :id ", [':id' => $id]);
        $result = $xJsonFormQuery->fetchField();
        if($result){
            $entity = $entityStorage->load($result);
            $value = json_decode($entity->get('xjson_definition')->value);
            $this->auth_required = $value->header->auth_not_required ? false : true;
        }

        return $result ? true : false;
    }
}
