<?php

namespace Drupal\htm_custom_authentication\Authentication\Provider;

use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Flood\FloodInterface;
use Drupal\htm_custom_authentication\CustomRoleSwitcher;
use Drupal\htm_custom_authentication\UserAuthInterface;
use Drupal\jwt\Authentication\Event\JwtAuthEvents;
use Drupal\jwt\Authentication\Event\JwtAuthGenerateEvent;
use Drupal\jwt\JsonWebToken\JsonWebToken;
use Drupal\jwt\Transcoder\JwtTranscoderInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * Class JsonAuthenticationProvider.
 */
class JsonAuthenticationProvider implements AuthenticationProviderInterface {

	/**
	 * The config factory.
	 *
	 * @var \Drupal\Core\Config\ConfigFactoryInterface
	 */
	protected $configFactory;

	/**
	 * The user auth service.
	 *
	 * @var \Drupal\htm_custom_authentication\UserAuthInterface
	 */
	protected $userAuth;

	/**
	 * The flood service.
	 *
	 * @var \Drupal\Core\Flood\FloodInterface
	 */
	protected $flood;

	/**
	 * The entity type manager.
	 *
	 * @var \Drupal\Core\Entity\EntityTypeManagerInterface
	 */
	protected $entityManager;

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
	 * @var \Drupal\htm_custom_authentication\CustomRoleSwitcher
	 */
	protected $roleSwitcher;


	/**
	 * JsonAuthenticationProvider constructor.
	 *
	 * @param ConfigFactoryInterface     $config_factory
	 * @param UserAuthInterface          $user_auth
	 * @param FloodInterface             $flood
	 * @param EntityTypeManagerInterface $entity_manager
	 * @param EventDispatcherInterface   $eventDispatcher
	 * @param JwtTranscoderInterface     $transcoder
	 * @param CustomRoleSwitcher         $roleSwitcher
	 */
	public function __construct (
		ConfigFactoryInterface $config_factory,
		UserAuthInterface $user_auth,
		FloodInterface $flood,
		EntityTypeManagerInterface $entity_manager,
		EventDispatcherInterface $eventDispatcher,
		JwtTranscoderInterface $transcoder,
		CustomRoleSwitcher $roleSwitcher) {
		$this->configFactory = $config_factory;
		$this->userAuth = $user_auth;
		$this->flood = $flood;
		$this->entityManager = $entity_manager;
		$this->eventDispatcher = $eventDispatcher;
		$this->transcoder = $transcoder;
		$this->roleSwitcher = $roleSwitcher;
	}

	/**
	 * Checks whether suitable authentication credentials are on the request.
	 *
	 * @param \Symfony\Component\HttpFoundation\Request $request
	 *   The request object.
	 *
	 * @return bool
	 *   TRUE if authentication credentials suitable for this provider are on the
	 *   request, FALSE otherwise.
	 */
	public function applies (Request $request) {
		$content = json_decode($request->getContent());
		if(isset($content->auth_method)){
			switch ($content->auth_method){
				case 'basic':
					$uname = $content->username;
					$upass = $content->password;
					return isset($uname) && isset($upass);
					break;
				case 'mobile_id':
					$sess_code = $content->session_code;
					$id_code = $content->id_code;
					return isset($sess_code) && isset($id_code);
					break;
				default:
					return FALSE;
					break;
			}
		}
		return FALSE;
	}

	/**
	 * {@inheritdoc}
	 */
	public function authenticate (Request $request) {
		$flood_config = $this->configFactory->get('user.flood');
		$content = json_decode($request->getContent());

		if (isset($content->username) && isset($content->password)) {
			$username = $content->username;
			$password = $content->password;
		} else if (isset($content->auth_method)) {
			$auth_method = $content->auth_method;
			$session_code = $content->session_code;
			$id_code = $content->id_code;
		}

		//if ($this->flood->isAllowed('json_authentication_provider.failed_login_ip', $flood_config->get('ip_limit'), $flood_config->get('ip_window'))) {
			if (isset($auth_method)) {
				switch ($auth_method) {
					case 'mobile_id':
						$uid = $this->userAuth->authenticateMobileId($session_code, $id_code);
						break;
				}
				if ($uid) {
					$this->flood->clear('json_authentication_provider.failed_login_user', $uid);
					return $this->entityManager->getStorage('user')->load($uid);
				} else {
					// Register a per-user failed login event.
					$this->flood->register('json_authentication_provider.failed_login_user', $flood_config->get('user_window'), $uid);
				}
			} else {
				$accounts = $this->entityManager->getStorage('user')->loadByProperties(['name' => $username, 'status' => 1]);
				$account = reset($accounts);
				if ($account) {
					if ($flood_config->get('uid_only')) {
						$identifier = $account->id();
					} else {
						$identifier = $account->id() . '-' . $request->getClientIP();
					}
					if ($this->flood->isAllowed('json_authentication_provider.failed_login_user', $flood_config->get('user_limit'), $flood_config->get('user_window'), $identifier)) {
						$uid = $this->userAuth->authenticate($username, $password);
						if ($uid) {
							$this->flood->clear('json_authentication_provider.failed_login_user', $identifier);
							return $this->entityManager->getStorage('user')->load($uid);
						} else {
							// Register a per-user failed login event.
							$this->flood->register('json_authentication_provider.failed_login_user', $flood_config->get('user_window'), $identifier);
						}
					}
				}
			}
		//}
		// Always register an IP-based failed login event.
		//$this->flood->register('json_authentication_provider.failed_login_ip', $flood_config->get('ip_window'));
		return [];
	}

	/**
	 * {@inheritdoc}
	 */
	public function cleanup (Request $request) { }

	/**
	 * {@inheritdoc}
	 */
	public function handleException (GetResponseForExceptionEvent $event) {
		$exception = $event->getException();
		if ($exception instanceof AccessDeniedHttpException) {
			$event->setException(
				new UnauthorizedHttpException('Invalid consumer origin.', $exception)
			);
			return true;
		}
		return false;
	}

	/**
	 * Generate a new JWT token calling all event handlers.
	 *
	 * @param null $type
	 * @param null $id
	 * @return string|bool
	 *   The encoded JWT token. False if there is a problem encoding.
	 */
	public function generateToken ($type = null, $id = null) {
		$this->setRole($type, $id);
		$event = new JwtAuthGenerateEvent(new JsonWebToken());
		$this->eventDispatcher->dispatch(JwtAuthEvents::GENERATE, $event);
		$event->addClaim('role', $this->roleSwitcher->getCurrentRole());
		$event->addClaim('username', $this->roleSwitcher->returnUser()->getIdCode());
    $event->addClaim('firstname', $this->roleSwitcher->returnUser()->getFirstName());
    $event->addClaim('lastname', $this->roleSwitcher->returnUser()->getLastName());
		$jwt = $event->getToken();
		$this->transcoder->setSecret('test');
		return $this->transcoder->encode($jwt);
	}


	/**
	 * @param $type
	 *    Role type
	 * @param $id
	 *    Role id
	 */
	private function setRole ($type, $id) {
		switch ($type) {
			case 'juridical':
				$this->roleSwitcher->setJuridicalPerson($id);
				break;
			default:
				$this->roleSwitcher->setNaturalPerson();
		}
	}
}
