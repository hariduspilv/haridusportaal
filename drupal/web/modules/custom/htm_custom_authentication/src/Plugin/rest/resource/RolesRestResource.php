<?php

namespace Drupal\htm_custom_authentication\Plugin\rest\resource;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_authentication\Authentication\Provider\JsonAuthenticationProvider;
use Drupal\htm_custom_authentication\CustomRoleSwitcher;
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
	 * @var JsonAuthenticationProvider
	 */
	protected $authenticator;

	/**
	 * @var CustomRoleSwitcher
	 */
	protected $roleSwitcher;

	/**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */

  protected $currentUser;


	/**
	 * RolesRestResource constructor.
	 *
	 * @param array                      $configuration
	 * @param                            $plugin_id
	 * @param                            $plugin_definition
	 * @param array                      $serializer_formats
	 * @param LoggerInterface            $logger
	 * @param AccountProxyInterface      $current_user
	 * @param JsonAuthenticationProvider $jsonAuthenticationProvider
	 * @param CustomRoleSwitcher         $roleSwitcher
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
    \Drupal::logger('xjson')->notice('<pre><code>Worked roles response ' . print_r($roles, TRUE) . '</code></pre>' );
	  $response = new ResourceResponse($roles, 200);

	  $cache_metadata = new CacheableMetadata();
	  $cache_metadata->addCacheContexts(['url.query_args', 'user']);

	  $response->addCacheableDependency($cache_metadata);

    return $response;
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
