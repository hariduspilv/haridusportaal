<?php

namespace Drupal\htm_custom_xjson_services\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\htm_custom_xjson_services\xJsonService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "xjson_form_rest_resource",
 *   label = @Translation("X json form rest resource"),
 *   uri_paths = {
 *     "https://www.drupal.org/link-relations/create" = "/xjson_form_service"
 *   }
 * )
 */
class xJsonFormRestResource extends ResourceBase {

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
        AccountProxyInterface $current_user,
        EhisConnectorService $ehisConnectorService) {
        parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
        $this->xJsonService = $xJsonService;
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

        // You must to implement the logic of your REST Resource here.
        // Use current user after pass authentication to validate access.
        //if (!$this->currentUser->isAuthenticated()) {
        //	throw new AccessDeniedHttpException();
        //}

        $response = $this->getXJsonForm($data);

        return empty($response) ? new ModifiedResourceResponse('Form name unknown!', 400) : new ModifiedResourceResponse($response, 200);
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

    private function getXJsonForm ($data) {
        $definition = $this->xJsonService->getXJsonFormDefinition($data);

        return $definition;
    }

    private function returnBuildedResponse ($response) {
        $builded_response = $this->xJsonService->buildFormv2($response);
        if (empty($builded_response)) return new ModifiedResourceResponse('Form building failed!', 500);
        return new ModifiedResourceResponse($builded_response, 200);
    }
}
