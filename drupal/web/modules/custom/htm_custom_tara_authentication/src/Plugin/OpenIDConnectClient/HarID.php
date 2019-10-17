<?php

namespace Drupal\htm_custom_tara_authentication\Plugin\OpenIDConnectClient;

use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\openid_connect\Plugin\OpenIDConnectClient\Generic;
use Drupal\openid_connect\StateToken;
use Exception;

/**
 * Generic OpenID Connect client.
 *
 * Used primarily to login to Drupal sites powered by oauth2_server or PHP
 * sites powered by oauth2-server-php.
 *
 * @OpenIDConnectClient(
 *   id = "harid",
 *   label = @Translation("HarID")
 * )
 */



class HarID extends Generic {

	protected $userInfoMapping = [
		'personal_code' => 'id_code',
	];

	public function authorize ($scope = 'openid') {
		$scope = 'openid personal_code profile';
        if($_SERVER['HTTP_HOST'] === 'test-htm.wiseman.ee:30000'){
            $redirect_uri = 'https://htm.wiseman.ee/custom/login/harid/return';
        }else{
            $redirect_uri = 'https://'.$_SERVER['HTTP_HOST'].'/custom/login/harid/return';
        }

		$url_options = [
			'query' => [
				'client_id' => $this->configuration['client_id'],
				'response_type' => 'code',
				'scope' => $scope,
				'redirect_uri' => $redirect_uri,
				'state' => StateToken::create(),
			],
		];

		$endpoints = $this->getEndpoints();
		// Clear _GET['destination'] because we need to override it.
		$this->requestStack->getCurrentRequest()->query->remove('destination');
		$authorization_endpoint = Url::fromUri($endpoints['authorization'], $url_options)->toString(TRUE);

		dump($authorization_endpoint);
		die();

		$response = new TrustedRedirectResponse($authorization_endpoint->getGeneratedUrl());
		// We can't cache the response, since this will prevent the state to be
		// added to the session. The kill switch will prevent the page getting
		// cached for anonymous users when page cache is active.
		\Drupal::service('page_cache_kill_switch')->trigger();

		return $response;
	}


	/**
	 * Implements OpenIDConnectClientInterface::retrieveIDToken().
	 *
	 * @param string $authorization_code
	 *   A authorization code string.
	 *
	 * @return array|bool
	 *   A result array or false.
	 */
	public function retrieveTokens($authorization_code) {
		$endpoints = $this->getEndpoints();
		if($_SERVER['HTTP_HOST'] === 'test-htm.wiseman.ee:30000'){
		    $redirect_uri = 'https://htm.wiseman.ee/custom/login/harid/return';
        }else{
            $redirect_uri = 'https://'.$_SERVER['HTTP_HOST'].'/custom/login/harid/return';
        }

		$request_options = [
			'form_params' => [
				'code' => $authorization_code,
				'client_id' => $this->configuration['client_id'],
				'client_secret' => $this->configuration['client_secret'],
				'redirect_uri' => $redirect_uri,
				'grant_type' => 'authorization_code',
			],
			'headers' => [
				'Accept' => 'application/json',
			],
		];

		/* @var \GuzzleHttp\ClientInterface $client */
		$client = $this->httpClient;
		try {
			$response = $client->post($endpoints['token'], $request_options);
			$response_data = json_decode((string) $response->getBody(), TRUE);

			// Expected result.
			$tokens = [
				'id_token' => isset($response_data['id_token']) ? $response_data['id_token'] : NULL,
				'access_token' => isset($response_data['access_token']) ? $response_data['access_token'] : NULL,
			];
			if (array_key_exists('expires_in', $response_data)) {
				$tokens['expire'] = REQUEST_TIME + $response_data['expires_in'];
			}
			if (array_key_exists('refresh_token', $response_data)) {
				$tokens['refresh_token'] = $response_data['refresh_token'];
			}
			return $tokens;
		}
		catch (Exception $e) {
			$variables = [
				'@message' => 'Could not retrieve tokens',
				'@error_message' => $e->getMessage(),
			];
			$this->loggerFactory->get('openid_connect_' . $this->pluginId)
				->error('@message. Details: @error_message', $variables);
			return FALSE;
		}
	}

	/**
	 * Implements OpenIDConnectClientInterface::retrieveUserInfo().
	 *
	 * @param string $access_token
	 *   An access token string.
	 *
	 * @return array|bool
	 *   A result array or false.
	 */
	public function retrieveUserInfo($access_token) {
		$request_options = [
			'headers' => [
				'Authorization' => 'Bearer ' . $access_token,
				'Accept' => 'application/json',
			],
		];
		$endpoints = $this->getEndpoints();

		$client = $this->httpClient;
		try {
			$response = $client->get($endpoints['userinfo'], $request_options);
			$response_data = (string) $response->getBody();
			#$response_data['sub'] = $response_data['personal_code'];
			return json_decode($response_data, TRUE);
		}
		catch (Exception $e) {
			$variables = [
				'@message' => 'Could not retrieve user profile information',
				'@error_message' => $e->getMessage(),
			];
			$this->loggerFactory->get('openid_connect_' . $this->pluginId)
				->error('@message. Details: @error_message', $variables);
			return FALSE;
		}
	}


}
