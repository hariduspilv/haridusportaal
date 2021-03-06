<?php

namespace Drupal\htm_custom_professional_certific\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "dashboard_service_rest_resource",
 *   label = @Translation("Dashboard service rest resource"),
 *   uri_paths = {
 *     "canonical" = "/dashboard/{service_name}/{tab_index}"
 *   }
 * )
 */
class ProfessionalCertificateRestResource extends ResourceBase {


	/**
	 * Ehis connector service
	 *
	 * @var EhisConnectorService
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
	 *   The serice key
	 *
	 * @param $tab.
	 *
	 * @throws \Symfony\Component\HttpKernel\Exception\HttpException
	 *   Throws exception expected.
	 *
	 * @return ResourceResponse
	 */
	public function get($service_name, $tab) {
		// You must to implement the logic of your REST Resource here.
		// Use current user after pass authentication to validate access.
		if (!$this->currentUser->hasPermission('access content')) {
			throw new AccessDeniedHttpException();
		}
  	switch ($service_name){
			case 'certificates':
				// @TODO  Mby security risk
				$method = $tab;
				$params = [];
				break;
			case 'eeIsikukaart':
				$method = 'getPersonalCard';
				$params = ['tab' => $tab];
				break;
      case 'deleteDoc':
        $method = 'deleteDocument';
        $params = ['id' => $tab, 'form_name' => 'MTSYS_TEGEVUSLUBA'];
        break;
			case 'applications':
				$method = 'getApplications';
				#$this->certificate->testApplications();
				$params = ['init' => (boolean) $tab, 'get_edi_data' => TRUE];
        break;
		  case 'educational_institution':
		  	$method = 'getEducationalInstitution';
		  	$params = ['id' => $tab, 'addTitle' => true];
		  	break;
			default:
				throw new BadRequestHttpException('Service name not found');
				break;
		}

		try{
			$json = $this->certificate->{$method}($params);
		}catch (RequestException $e){
      \Drupal::logger('xjson')->notice('<pre><code>Dashboard '.$service_name.' response: '. print_r($e->getMessage(), TRUE) . '</code></pre>' );
			return new ResourceResponse($e->getMessage(), $e->getCode());
		}

    $response = new ModifiedResourceResponse($json, 200);
    \Drupal::logger('xjson')->notice('<pre><code>Dashboard '.$service_name.' response: '. print_r($response, TRUE) . '</code></pre>' );

		return $response;
	}

}
