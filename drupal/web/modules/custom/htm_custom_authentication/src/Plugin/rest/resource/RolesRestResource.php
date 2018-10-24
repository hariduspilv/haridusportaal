<?php

namespace Drupal\htm_custom_authentication\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_authentication\Authentication\Provider\JsonAuthenticationProvider;
use Drupal\htm_custom_authentication\CustomRoleSwitcher;
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
 *   id = "roles_rest_resource",
 *   label = @Translation("Get companies rest resource"),
 *   uri_paths = {
 *     "canonical" = "/custom/login/getRoles",
 *     "create" = "/custom/login/setRole"
 *   }
 * )
 */
class RolesRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */

  protected $currentUser;

	/**
	 * @var LoggerInterface
	 */
	protected $logger;

	/**
	 * @var JsonAuthenticationProvider
	 */
	protected $authenticator;

	/**
	 * @var CustomRoleSwitcher
	 */
	protected $roleSwitcher;
  /**
   * Constructs a new GetCompaniesRestResource object.
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
		JsonAuthenticationProvider $jsonAuthenticationProvider,
		CustomRoleSwitcher $roleSwitcher) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);
		$this->authenticator = $jsonAuthenticationProvider;
		$this->roleSwitcher = $roleSwitcher;
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
      $container->get('authentication.custom_graphql_authentication'),
	    $container->get('current_user.role_switcher')

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

	  /*@TODO mby add default userRole aswell to response*/
	  $roles = $this->roleSwitcher->getAvailableRoles();
    return new ResourceResponse($roles, 200);
  }

  /**
   * Responds to POST requests.
   *
   * @param $data
   *   The POST Data.
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

	  //Generate new jwt
	  $token = $this->authenticator->generateToken($data['type'], $data['id']);


    return new ModifiedResourceResponse(["token" => $token], 200);
  }

}
