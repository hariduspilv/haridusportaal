<?php

namespace Drupal\htm_custom_professional_certific\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_professional_certific\ProfessionalCertificateService;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Drupal\user\Entity\User;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "professional_certificate_rest_resource",
 *   label = @Translation("Professional certificate rest resource"),
 *   uri_paths = {
 *     "canonical" = "/professional-certificate"
 *   }
 * )
 */
class ProfessionalCertificateRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * Constructs a new ProfessionalCertificateRestResource object.
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
    AccountProxyInterface $current_user,
		ProfessionalCertificateService $professionalCertificateService) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
		$this->certificate = $professionalCertificateService;
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
			$container->get('htm_custom_professional_certific.default')
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
  public function get() {
		// You must to implement the logic of your REST Resource here.
		// Use current user after pass authentication to validate access.
		if (!$this->currentUser->hasPermission('access content')) {
			throw new AccessDeniedHttpException();
		}

		try{
			$json = $this->certificate->getProfessionalCertificate(['key' => 'KUTSEREGISTER', 'field' => 'kutsetunnistused_']);
			return new ModifiedResourceResponse($json);
		}catch (RequestException $e){
			return new ModifiedResourceResponse($e->getMessage(), $e->getCode());
		}
	}

}
