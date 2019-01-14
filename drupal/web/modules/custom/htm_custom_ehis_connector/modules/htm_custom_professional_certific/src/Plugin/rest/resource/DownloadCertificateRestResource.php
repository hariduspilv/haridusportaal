<?php

namespace Drupal\htm_custom_professional_certific\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Hshn\Base64EncodedFile\HttpFoundation\File\Base64EncodedFile;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "download_certificate_rest_resource",
 *   label = @Translation("Download certificate rest resource"),
 *   uri_paths = {
 *     "canonical" = "/certificate-download/{certificate_id}"
 *   }
 * )
 */
class DownloadCertificateRestResource extends ResourceBase {


	/**
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
	 * DownloadCertificateRestResource constructor.
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
      $container->get('logger.factory')->get('htm_custom_ehis_connector'),
      $container->get('current_user'),
			$container->get('htm_custom_ehis_connector.default')
    );
  }


	/**
	 * @param $certificate_id
	 * @return ResourceResponse|BinaryFileResponse
	 */
	public function get($certificate_id) {

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }
		$params['certificate_id'] = $certificate_id;
    $json = $this->certificate->getCertificate($params);

    if($document = $json['value']['tunnistus']){
			$sym_file = new Base64EncodedFile($document['value']);
			$response = new BinaryFileResponse($sym_file->getRealPath());
			$response->setContentDisposition(
					ResponseHeaderBag::DISPOSITION_ATTACHMENT,
					$document['filename']
			);
	    $response->setMaxAge(0);
			return $response;
		}

		return new ResourceResponse('Certificate not found', 404);
  }

}
