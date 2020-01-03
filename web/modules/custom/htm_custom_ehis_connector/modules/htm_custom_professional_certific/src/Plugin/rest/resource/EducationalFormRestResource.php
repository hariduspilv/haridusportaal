<?php

namespace Drupal\htm_custom_professional_certific\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
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
 *   id = "educational_form_rest_resource",
 *   label = @Translation("Educational form rest resource"),
 *   uri_paths = {
 *     "canonical" = "/educational-institution/data",
 *     "create" = "/educational-institution/{action}"
 *   }
 * )
 */
class EducationalFormRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

	/**
	 * @var EhisConnectorService
	 */
	protected $ehisConnector;


	/**
	 * EducationalFormRestResource constructor.
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
		$this->ehisConnector = $ehisConnectorService;
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
   * Responds to GET requests.
   *
   * @return \Drupal\rest\ResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function get() {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
    $data = $this->ehisConnector->getEducationalInstitutionClassificators();

    return new ResourceResponse($data, 200);
  }


	/**
	 * @param $action
	 * @param $data
	 * @return ModifiedResourceResponse
	 */
	public function post($action, $data){
	  if (!$this->currentUser->hasPermission('access content')) {
		  throw new AccessDeniedHttpException();
	  }

		$validation = $this->validateData2($action, $data);

	  switch ($action){
		  case 'add':
		  	if($validation[0]){
					$response = $this->ehisConnector->addInstitution(['data' => $data]);
          $this->ehisConnector->deleteKeyFromredis($this->ehisConnector->getCurrentUserIdRegCode(FALSE));
				  return new ModifiedResourceResponse($response);
			  }else{
		  		return new ModifiedResourceResponse($validation[1] . " missing from body", 400);
			  }
				break;
		  case 'edit':
			  if($validation[0]){
			  	$response = $this->ehisConnector->editInstitution(['data' => $data]);
			  	if(isset($response['message'])){
            $this->ehisConnector->deleteKeyFromredis($this->ehisConnector->getCurrentUserIdRegCode(FALSE));
          }
				  return new ModifiedResourceResponse($response);
			  }else{
				  return new ModifiedResourceResponse($validation[1] . " missing from body", 400);
			  }
		  	break;
	  }

  	return new ModifiedResourceResponse('Wrong action or missing some keys', 400);
  }

  private function validateData2($action, $data){
	  $required_add_keys = [
		  'general' => [
		  	'name' => '',
		    'ownerType' => '',
		    'ownershipType' => '',
		    'studyInstitutionType' => '',
		  ]
	  ];
	  $required_keys = [
		  'address' => [
			  'seqNo' =>  0,
				'adsId' => 0,
				'adsOid' =>  '',
				'klElukoht' => '',
				'county' =>  '',
				'localGovernment' =>  '',
				'settlementUnit' =>  '',
				'address' =>  '',
				'addressFull' =>  '',
				'addressHumanReadable' =>  ''
		  ],
		  'contacts' => [
		  	'contactPhone' => '',
			  'contactEmail' => '',
			  'webpageAddress' => '',
		  ]
	  ];
	  if($action === 'add') $required_keys = array_merge($required_keys, $required_add_keys);

	  $d = $this->validateAgainstSchema($required_keys, $data );

	  dump($data);
	  dump($d);

	  return $d;

  }

	private function validateAgainstSchema(array $schema, $data) {
		$valid = true;
		$path = "";

		foreach($schema as $schema_key => $schema_value){
			$valid = isset($data[$schema_key]);
			$path = $schema_key;
			if(is_array($schema_value) && $valid){
				list($valid, $index)  = $this->validateAgainstSchema($schema_value, $data[$schema_key]);
				$path .= ".$index";
			}

			if(!$valid) break;
		}

		return [ $valid, $valid ? "" : $path ];
	}

}
