<?php

namespace Drupal\htm_custom_tara_authentication\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\Url;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;
use Drupal\openid_connect\StateToken;

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
				'redirect_uri' => $redirect_uri->getGeneratedUrl(),
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


}
