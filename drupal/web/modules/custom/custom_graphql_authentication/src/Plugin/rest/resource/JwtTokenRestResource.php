<?php

namespace Drupal\custom_graphql_authentication\Plugin\rest\resource;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\jwt\Authentication\Event\JwtAuthEvents;
use Drupal\jwt\JsonWebToken\JsonWebToken;
use Drupal\jwt\Transcoder\JwtTranscoderInterface;
use Drupal\rest\ModifiedResourceResponse;
use Drupal\rest\Plugin\ResourceBase;
use Drupal\rest\ResourceResponse;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

use Drupal\jwt\Authentication\Event\JwtAuthGenerateEvent;
use Drupal\jwt\Authentication\Provider\JwtAuth;

/**
 * Provides a resource to get view modes by entity and bundle.
 *
 * @RestResource(
 *   id = "jwt_token_rest_resource",
 *   label = @Translation("Jwt token rest resource"),
 *   uri_paths = {
 *     "create" = "/api/v1/token",
 *   }
 * )
 */
class JwtTokenRestResource extends ResourceBase {

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
   * Constructs a new JwtTokenRestResource object.
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
		JwtTranscoderInterface $transcoder,
		EventDispatcherInterface $event_dispatcher) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $serializer_formats, $logger);

    $this->currentUser = $current_user;
		$this->transcoder = $transcoder;
    $this->eventDispatcher = $event_dispatcher;
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
      $container->get('logger.factory')->get('custom_graphql_authentication'),
      $container->get('current_user'),
			$container->get('jwt.transcoder'),
			$container->get('event_dispatcher')
    );
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
  public function post() {

  	if($this->currentUser->isAnonymous()){
  		$data['message'] = $this->t('Login failed');
		}else{
  		$data['message'] = $this->t('Login succeeded');
  		$data['token'] = $this->generateToken();
		}

    // You must to implement the logic of your REST Resource here.
    // Use current user after pass authentication to validate access.
    /*if (!$this->currentUser->hasPermission('access content')) {
      throw new AccessDeniedHttpException();
    }*/

    return new ModifiedResourceResponse($data, 200);
  }

  protected function generateToken(){
		$event = new JwtAuthGenerateEvent(new JsonWebToken());
		$event->addClaim('username', $this->currentUser->getDisplayName());
		$this->eventDispatcher->dispatch(JwtAuthEvents::GENERATE, $event);
		$jwt = $event->getToken();
		return $this->transcoder->encode($jwt);
	}

}
