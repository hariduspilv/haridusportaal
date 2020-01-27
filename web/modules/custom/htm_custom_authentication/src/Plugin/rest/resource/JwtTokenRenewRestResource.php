<?php

namespace Drupal\htm_custom_authentication\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_authentication\Authentication\Provider\JsonAuthenticationProvider;
use Drupal\jwt\Transcoder\JwtTranscoderInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "jwt_token_renew_rest_resource",
 *   label = @Translation("Jwt token renew rest resource"),
 *   uri_paths = {
 *     "create" = "/api/v1/token-renew",
 *   }
 * )
 */
class JwtTokenRenewRestResource extends ResourceBase {

  /**
   * A current user instance.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

	/**
	 * The event dispatcher.
	 *
	 * @var \Symfony\Component\EventDispatcher\EventDispatcherInterface
	 */
	protected $eventDispatcher;

	/**
	 * The JWT Transcoder service.
	 *
	 * @var \Drupal\jwt\Transcoder\JwtTranscoderInterface
	 */
	protected $transcoder;


	/**
	 * @var JsonAuthenticationProvider
	 */
	protected $authenticator;


	/**
	 * JwtTokenRestResource constructor.
	 *
	 * @param array                      $configuration
	 * @param                            $plugin_id
	 * @param                            $plugin_definition
	 * @param array                      $serializer_formats
	 * @param LoggerInterface            $logger
	 * @param AccountProxyInterface      $current_user
	 * @param JwtTranscoderInterface     $transcoder
	 * @param EventDispatcherInterface   $event_dispatcher
	 * @param JsonAuthenticationProvider $jsonAuthenticationProvider
	 */
	public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    array $serializer_formats,
    LoggerInterface $logger,
    AccountProxyInterface $current_user,
		JwtTranscoderInterface $transcoder,
		EventDispatcherInterface $event_dispatcher,
    JsonAuthenticationProvider $jsonAuthenticationProvider) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
		$this->transcoder = $transcoder;
    $this->eventDispatcher = $event_dispatcher;
	  $this->authenticator = $jsonAuthenticationProvider;
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
      $container->get('logger.factory')->get('htm_custom_authentication'),
      $container->get('current_user'),
			$container->get('jwt.transcoder'),
			$container->get('event_dispatcher'),
	    $container->get('authentication.custom_graphql_authentication')
    );
  }

  /**
   * Responds to POST requests.
   *
   * @param $data
   *   POST data
   *
   * @return \Drupal\rest\ModifiedResourceResponse
   *   The HTTP response object.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\HttpException
   *   Throws exception expected.
   */
  public function post($data) {
    if($this->currentUser->isAnonymous()){
			return new ModifiedResourceResponse('Authentication failed', 403);
		}

	  $response['message'] = $this->t('Renewal succeeded');
	  $response['token'] = $this->authenticator->generateToken();
	  return new ModifiedResourceResponse($response, 200);
  }

}
