<?php

namespace Drupal\htm_custom_authentication\Authentication\Provider;

use Drupal\jwt\Authentication\Event\JwtAuthEvents;
use Drupal\jwt\Authentication\Event\JwtAuthValidateEvent;
use Drupal\jwt\Authentication\Event\JwtAuthValidEvent;
use Drupal\jwt\Authentication\Provider\JwtAuth;
use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\jwt\Transcoder\JwtDecodeException;
use Drupal\jwt\Transcoder\JwtTranscoderInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * JWT Authentication Provider.
 */
class CustomJwtAuth extends JwtAuth implements AuthenticationProviderInterface {

  /**
   * @var \Drupal\Core\Config\ImmutableConfig
   */
  protected $config;

  /**
   * The JWT Transcoder service.
   *
   * @var \Drupal\jwt\Transcoder\JwtTranscoderInterface
   */
  protected $transcoder;

  /**
   * The event dispatcher.
   *
   * @var \Symfony\Component\EventDispatcher\EventDispatcherInterface
   */
  protected $eventDispatcher;

  /**
   * Constructs a HTTP basic authentication provider object.
   *
   * @param \Drupal\jwt\Transcoder\JwtTranscoderInterface $transcoder
   *   The jwt transcoder service.
   * @param \Symfony\Component\EventDispatcher\EventDispatcherInterface $event_dispatcher
   *   The event dispatcher service.
   */
  public function __construct(
    JwtTranscoderInterface $transcoder,
    EventDispatcherInterface $event_dispatcher
  ) {
    $this->transcoder = $transcoder;
    $this->eventDispatcher = $event_dispatcher;
    $this->config = \Drupal::config('jwt');
  }

	/**
	 * @param Request $request
	 * @return bool|false|int
	 */
	public function applies (Request $request) {
		$auth = $request->headers->get('Authorization');
		$auth_param = $request->get('jwt_token');
		return (preg_match('/^Bearer .+/', $auth) || $auth_param);
	}

  /**
   * {@inheritdoc}
   */
  public function authenticate(Request $request) {
    dump($this->config);
    $raw_jwt = $this->getJwtFromRequest($request);

    // Decode JWT and validate signature.
    try {
      $this->transcoder->setSecret('test');
      $jwt = $this->transcoder->decode($raw_jwt);
    }
    catch (JwtDecodeException $e) {
      throw new AccessDeniedHttpException($e->getMessage(), $e);
    }

    $validate = new JwtAuthValidateEvent($jwt);
    // Signature is validated, but allow modules to do additional validation.
    $this->eventDispatcher->dispatch(JwtAuthEvents::VALIDATE, $validate);
    if (!$validate->isValid()) {
      throw new AccessDeniedHttpException($validate->invalidReason());
    }

    $valid = new JwtAuthValidEvent($jwt);
    $this->eventDispatcher->dispatch(JwtAuthEvents::VALID, $valid);
    $user = $valid->getUser();

    if (!$user) {
      throw new AccessDeniedHttpException('Unable to load user from provided JWT.');
    }

    return $user;
  }

	/**
	 * @param Request $request
	 * @return bool|mixed|string
	 */
	protected function getJwtFromRequest (Request $request) {
		$auth_header = $request->headers->get('Authorization');
		$auth_param = $request->get('jwt_token');
		$matches = [];
		if ($hasJWT = preg_match('/^Bearer (.*)/', $auth_header, $matches)) {
			$return = $matches[1];
		} elseif ($auth_param) {
			$return = $auth_param;
		} else {
			$return = false;
		}

		return $return;
	}


}
