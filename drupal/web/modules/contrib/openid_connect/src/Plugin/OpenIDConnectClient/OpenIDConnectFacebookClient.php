<?php

namespace Drupal\openid_connect\Plugin\OpenIDConnectClient;

use Drupal\Core\Form\FormStateInterface;
use Drupal\openid_connect\Plugin\OpenIDConnectClientBase;

/**
 * Facebook OpenID Connect client.
 *
 * Implements OpenID Connect Client plugin for Facebook.
 *
 * @OpenIDConnectClient(
 *   id = "facebook",
 *   label = @Translation("Facebook")
 * )
 */
class OpenIDConnectFacebookClient extends OpenIDConnectClientBase {

  /**
   * Facebook API versions.
   *
   * @var array
   */
  protected $versions = [
    'v2.12', 'v2.11', 'v2.10', 'v2.9', 'v2.8', 'v2.7', 'v2.6', 'v2.5', 'v2.4', 'v2.3',
  ];

  /**
   * Facebook fields.
   *
   * @var array
   */
  protected $fields = [
    'id', 'name', 'email', 'first_name', 'last_name', 'gender', 'locale', 'timezone', 'picture',
  ];

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'api_version' => '',
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form = parent::buildConfigurationForm($form, $form_state);

    $form['api_version'] = [
      '#title' => $this->t('API Version'),
      '#type' => 'select',
      '#options' => array_combine($this->versions, $this->versions),
      '#default_value' => $this->configuration['api_version'],
    ];
    $url = 'https://developers.facebook.com/apps/';
    $form['description'] = [
      '#markup' => '<div class="description">' . $this->t('Set up your app in <a href="@url" target="_blank">my apps</a> on Facebook.', ['@url' => $url]) . '</div>',
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getEndpoints() {
    return [
      'authorization' => 'https://www.facebook.com/' . $this->configuration['api_version'] . '/dialog/oauth',
      'token' => 'https://graph.facebook.com/' . $this->configuration['api_version'] . '/oauth/access_token',
      'userinfo' => 'https://graph.facebook.com/' . $this->configuration['api_version'] . '/me',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function authorize($scope = 'openid email') {
    // Use Facebook specific authorisations.
    return parent::authorize('public_profile email');
  }

  /**
   * {@inheritdoc}
   */
  public function decodeIdToken($id_token) {
    return [];
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
      'query' => [
        'access_token' => $access_token,
        'fields' => implode(',', $this->fields),
      ],
      'headers' => [
        'Accept' => 'application/json',
      ],
    ];
    $endpoints = $this->getEndpoints();

    /** @var \GuzzleHttp\Client $client */
    $client = $this->httpClient;
    try {
      $response = $client->get($endpoints['userinfo'], $request_options);
      $response_data = (string) $response->getBody();
      $userinfo = json_decode($response_data, TRUE);
      $userinfo['sub'] = $userinfo['id'];

      if (!empty($userinfo['picture']['data']['url'])) {
        $userinfo['picture'] = $userinfo['picture']['data']['url'];
      }

      return $userinfo;
    }
    catch (\Exception $e) {
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
