<?php

namespace Drupal\custom_graphql_authentication\Authentication\Provider;

use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Flood\FloodInterface;
use Drupal\user\UserAuthInterface;
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
	 * @var \Drupal\user\UserAuthInterface
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
   * Constructs a HTTP basic authentication provider object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   */
  public function __construct(ConfigFactoryInterface $config_factory, UserAuthInterface $user_auth, FloodInterface $flood, EntityTypeManagerInterface $entity_manager) {
    $this->configFactory = $config_factory;
    $this->userAuth = $user_auth;
    $this->flood = $flood;
    $this->entityManager = $entity_manager;
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
  public function applies(Request $request) {
		$content = json_decode($request->getContent());
		return isset($content->username, $content->password) && !empty($content->username) && !empty($content->password);

    // If you return TRUE and the method Authentication logic fails,
    // you will get out from Drupal navigation if you are logged in.
    //return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function authenticate(Request $request) {
		$flood_config = $this->configFactory->get('user.flood');
		$content = json_decode($request->getContent());

		$username = $content->username;
		$password = $content->password;

		if ($this->flood->isAllowed('json_authentication_provider.failed_login_ip', $flood_config->get('ip_limit'), $flood_config->get('ip_window'))) {
			$accounts = $this->entityManager->getStorage('user')->loadByProperties(['name' => $username, 'status' => 1]);
			$account = reset($accounts);
			if ($account) {
				if ($flood_config->get('uid_only')) {
					// Register flood events based on the uid only, so they apply for any
					// IP address. This is the most secure option.
					$identifier = $account->id();
				}
				else {
					// The default identifier is a combination of uid and IP address. This
					// is less secure but more resistant to denial-of-service attacks that
					// could lock out all users with public user names.
					$identifier = $account->id() . '-' . $request->getClientIP();
				}
				// Don't allow login if the limit for this user has been reached.
				// Default is to allow 5 failed attempts every 6 hours.
				if ($this->flood->isAllowed('json_authentication_provider.failed_login_user', $flood_config->get('user_limit'), $flood_config->get('user_window'), $identifier)) {
					$uid = $this->userAuth->authenticate($username, $password);
					if ($uid) {
						$this->flood->clear('json_authentication_provider.failed_login_user', $identifier);
						return $this->entityManager->getStorage('user')->load($uid);
					}
					else {
						// Register a per-user failed login event.
						$this->flood->register('json_authentication_provider.failed_login_user', $flood_config->get('user_window'), $identifier);
					}
				}
			}
		}
		// Always register an IP-based failed login event.
		$this->flood->register('json_authentication_provider.failed_login_ip', $flood_config->get('ip_window'));
		return [];
	}
  /**
   * {@inheritdoc}
   */
  public function cleanup(Request $request) {}

  /**
   * {@inheritdoc}
   */
  public function handleException(GetResponseForExceptionEvent $event) {
    $exception = $event->getException();
    if ($exception instanceof AccessDeniedHttpException) {
      $event->setException(
        new UnauthorizedHttpException('Invalid consumer origin.', $exception)
      );
      return TRUE;
    }
    return FALSE;
  }

}
