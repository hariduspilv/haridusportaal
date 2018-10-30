<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\htm_custom_authentication\Authentication\Provider\JsonAuthenticationProvider;
use Drupal\openid_connect\Claims;
use Drupal\openid_connect\Controller\RedirectController;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
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
		$token = $this->jsonAuth->generateToken();
		$_SESSION['openid_connect_destination'] = [
			'/user',
			['query' => '?jwt='.$token]
		];
		return parent::authenticate($client_name);
		dump($token);
		die();

	}

	public function startAuth(){
		#htm_custom_tara_authentication_openid_connect_save_destination();
		$configuration = $this->config('openid_connect.settings.tara')
			->get('settings');

		$client = $this->pluginManager->createInstance(
			'tara',
			$configuration
		);

		$scopes = $this->claims->getScopes();
		$_SESSION['openid_connect_op'] = 'login';

		$response = $client->authorize($scopes);

		return $response;
	}
}