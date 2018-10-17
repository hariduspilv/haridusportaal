<?php

namespace Drupal\htm_custom_authentication\Plugin\rest\resource;

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
      $container->get('logger.factory')->get('htm_custom_authentication'),
      $container->get('current_user'),
			$container->get('jwt.transcoder'),
			$container->get('event_dispatcher')
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
    else if(!$data['username'] || !$data['password']){
			return new ModifiedResourceResponse('Username or password missing', 403);
		}
    else if($data['username'] && $data['password']){
			$response['message'] = $this->t('Login succeeded');
			$response['token'] = $this->generateToken();
			return new ModifiedResourceResponse($response, 200);
		}
    else if($data['id_code']){
			$response['message'] = $this->t('Login succeeded');
			$response['token'] = $this->generateIdCodeToken($data);
			return new ModifiedResourceResponse($response, 200);
		}
  }

  protected function generateIdCodeToken($data){
		$event = new JwtAuthGenerateEvent(new JsonWebToken());
    $event->addClaim('name', $data['name']);
    $event->addClaim('id_code', $data['id_code']);
		$this->eventDispatcher->dispatch(JwtAuthEvents::GENERATE, $event);
		$jwt = $event->getToken();
		return $this->transcoder->encode($jwt);
	}

  protected function generateToken(){
    $event = new JwtAuthGenerateEvent(new JsonWebToken());
    $event->addClaim('username', $this->currentUser->getDisplayName());
    $this->eventDispatcher->dispatch(JwtAuthEvents::GENERATE, $event);
    $jwt = $event->getToken();
    return $this->transcoder->encode($jwt);
  }

}
