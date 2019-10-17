<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Url;
use Drupal\htm_custom_authentication\Authentication\Provider\JsonAuthenticationProvider;
use Drupal\openid_connect\Claims;
use Drupal\openid_connect\Controller\RedirectController;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Drupal\openid_connect\StateToken;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class TaraRedirectController extends RedirectController{

	protected $claims;

	protected $jsonAuth;

	public function __construct (OpenIDConnectClientManager $plugin_manager, RequestStack $request_stack, LoggerChannelFactoryInterface $logger_factory, AccountInterface $current_user, Claims $claims, JsonAuthenticationProvider $jsonAuth) {
		parent::__construct($plugin_manager, $request_stack, $logger_factory, $current_user);
		$this->claims = $claims;
		$this->jsonAuth = $jsonAuth;
	}

	public static function create (ContainerInterface $container) {
		return new static(
			$container->get('plugin.manager.openid_connect_client.processor'),
			$container->get('request_stack'),
			$container->get('logger.factory'),
			$container->get('current_user'),
			$container->get('openid_connect.claims'),
			$container->get('authentication.custom_graphql_authentication')
		);

	}

	public function authenticate ($client_name) {
		header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
		header("Cache-Control: post-check=0, pre-check=0", false);
		header("Pragma: no-cache");

		$query = $this->requestStack->getCurrentRequest()->query;
		$redirect_home = false;
		// Delete the state token, since it's already been confirmed.
		unset($_SESSION['openid_connect_state']);

		// Get parameters from the session, and then clean up.
		$parameters = [
			'destination' => $this->config('htm_custom_admin_form.customadmin')->get('general.fe_url'),
			'op' => 'login',
			'connect_uid' => NULL,
		];
		foreach ($parameters as $key => $default) {
			unset($_SESSION['openid_connect_' . $key]);
		}
		$destination = $parameters['destination'];

		$configuration = $this->config('openid_connect.settings.' . $client_name)
			->get('settings');
		$client = $this->pluginManager->createInstance(
			$client_name,
			$configuration
		);
		if (!$query->get('error') && (!$client || !$query->get('code'))) {
			// In case we don't have an error, but the client could not be loaded or
			// there is no state token specified, the URI is probably being visited
			// outside of the login flow.
			$redirect_home = true;
			#throw new NotFoundHttpException();
		}

		$provider_param = ['@provider' => $client->getPluginDefinition()['label']];

		if ($query->get('error')) {
			if (in_array($query->get('error'), [
				'interaction_required',
				'login_required',
				'account_selection_required',
				'consent_required',
			])) {
				// If we have an one of the above errors, that means the user hasn't
				// granted the authorization for the claims.
				$this->messenger()->addWarning($this->t('Logging in with @provider has been canceled.', $provider_param));
			}
			else {
				// Any other error should be logged. E.g. invalid scope.
				$variables = [
					'@error' => $query->get('error'),
					'@details' => $query->get('error_description') ? $query->get('error_description') : $this->t('Unknown error.'),
				];
				$message = 'Authorization failed: @error. Details: @details';
				$this->loggerFactory->get('openid_connect_' . $client_name)->error($message, $variables);
				$this->messenger()->addError($this->t('Could not authenticate with @provider.', $provider_param));
			}
		}
		else {
			// Process the login or connect operations.
			$tokens = $client->retrieveTokens($query->get('code'));
			if ($tokens) {
				if ($parameters['op'] === 'login') {
					$success = openid_connect_complete_authorization($client, $tokens, $destination);

					dump($success);
					die();
					$register = \Drupal::config('user.settings')->get('register');
					if (!$success && $register !== USER_REGISTER_ADMINISTRATORS_ONLY) {
						$this->messenger()->addError(t('Logging in with @provider could not be completed due to an error.', $provider_param));
					}
				}
				elseif ($parameters['op'] === 'connect' && $parameters['connect_uid'] === $this->currentUser->id()) {
					$success = openid_connect_connect_current_user($client, $tokens);
					if ($success) {
						$this->messenger()->addMessage($this->t('Account successfully connected with @provider.', $provider_param));
					}
					else {
						$this->messenger()->addError($this->t('Connecting with @provider could not be completed due to an error.', $provider_param));
					}
				}
			}
		}

		$fe_url = $this->config('htm_custom_admin_form.customadmin')->get('general.fe_url').'/auth.html';
		if(empty($this->messenger()->all()) && !$redirect_home){
			$query = ['jwt' => $this->jsonAuth->generateToken(), 'error' => 'false'];
		}elseif($redirect_home){
			$query = [];
		}else{
			$query = ['error' => 'true'];
		}
		$redirect = Url::fromUri($fe_url, ['query' => $query, 'http' => true])->toString();
		#dump($redirect);
		#die();
		// log user out because we have own jwt token for auth and dont need session
		user_logout();
		return new TrustedRedirectResponse($redirect);

	}

	public function startAuth($method){
		$configuration = $this->config('openid_connect.settings.' . $method)
			->get('settings');

		$client = $this->pluginManager->createInstance(
			$method,
			$configuration
		);

		$scopes = $this->claims->getScopes();
		$_SESSION['openid_connect_op'] = 'login';

		$response = $client->authorize($scopes);

		return $response;
	}
}
