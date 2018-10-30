<?php

namespace Drupal\htm_custom_tara_authentication\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;
use Drupal\openid_connect\StateToken;
use Exception;

/**
 * Generic OpenID Connect client.
 *
 * Used primarily to login to Drupal sites powered by oauth2_server or PHP
 * sites powered by oauth2-server-php.
 *
 * @OpenIDConnectClient(
 *   id = "tara",
 *   label = @Translation("TARA")
 * )
 */
class Tara extends OpenIDConnectClientBase {

	/**
	 * {@inheritdoc}
	 */
	public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
		$form = parent::buildConfigurationForm($form, $form_state);
		dump($form);
		$form['authorization_endpoint'] = [
			'#title' => $this->t('Authorization endpoint'),
			'#type' => 'textfield',
			'#default_value' => $this->configuration['authorization_endpoint'],
		];
		$form['token_endpoint'] = [
			'#title' => $this->t('Token endpoint'),
			'#type' => 'textfield',
			'#default_value' => $this->configuration['token_endpoint'],
		];

		return $form;
	}

	/**
	 * {@inheritdoc}
	 */
	public function getEndpoints() {
		return [
			'authorization' => $this->configuration['authorization_endpoint'],
			'token' => $this->configuration['token_endpoint']
		];
	}

	public function authorize($scope = 'openid') {
		$language_none = \Drupal::languageManager()
			->getLanguage(LanguageInterface::LANGCODE_NOT_APPLICABLE);
		$redirect_uri = Url::fromRoute(
			'htm_custom_tara_authentication.redirect_controller_redirect',
			[
				'client_name' => $this->pluginId,
			],
			[
				'absolute' => TRUE,
				'language' => $language_none,
			]
		)->toString(TRUE);

		$url_options = [
			'query' => [
				'client_id' => $this->configuration['client_id'],
				'response_type' => 'code',
				'scope' => 'openid',
				'redirect_uri' => 'https://htm.wiseman.ee/custom/login/tara/return',
				'state' => StateToken::create(),
			],
		];

		$endpoints = $this->getEndpoints();
		// Clear _GET['destination'] because we need to override it.
		$this->requestStack->getCurrentRequest()->query->remove('destination');
		$authorization_endpoint = Url::fromUri($endpoints['authorization'], $url_options)->toString(TRUE);

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
		// Exchange `code` for access token and ID token.
		$language_none = \Drupal::languageManager()
			->getLanguage(LanguageInterface::LANGCODE_NOT_APPLICABLE);
		$redirect_uri = Url::fromRoute(
			'openid_connect.redirect_controller_redirect',
			[
				'client_name' => $this->pluginId,
			],
			[
				'absolute' => TRUE,
				'language' => $language_none,
			]
		)->toString();
		$endpoints = $this->getEndpoints();

		$request_options = [
			'form_params' => [
				'code' => $authorization_code,
				'client_id' => $this->configuration['client_id'],
				'client_secret' => $this->configuration['client_secret'],
				'redirect_uri' => 'https://htm.wiseman.ee/custom/login/tara/return',
				'grant_type' => 'authorization_code',
			],
			'headers' => [
				'Accept' => 'application/json',
				'Authorization' => 'Basic ' .base64_encode($this->configuration['client_id'] .':'. $this->configuration['client_secret'])
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
		dump($access_token);
	}


}
