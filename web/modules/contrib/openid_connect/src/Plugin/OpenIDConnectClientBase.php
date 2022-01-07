<?php

namespace Drupal\openid_connect\Plugin;

use Drupal\Component\Plugin\PluginBase;
use Drupal\Component\Utility\NestedArray;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\GeneratedUrl;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\PageCache\ResponsePolicy\KillSwitch;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Routing\TrustedRedirectResponse;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\Url;
use Drupal\openid_connect\OpenIDConnectStateTokenInterface;
use GuzzleHttp\ClientInterface;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\Component\Datetime\TimeInterface;

/**
 * Base class for OpenID Connect client plugins.
 */
abstract class OpenIDConnectClientBase extends PluginBase implements OpenIDConnectClientInterface, ContainerFactoryPluginInterface {
  use StringTranslationTrait;

  /**
   * The request stack used to access request globals.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The HTTP client to fetch the feed data with.
   *
   * @var \GuzzleHttp\ClientInterface
   */
  protected $httpClient;

  /**
   * The minimum set of scopes for this client.
   *
   * @var string[]|null
   *
   * @see \Drupal\openid_connect\OpenIDConnectClaims::getScopes()
   */
  protected $clientScopes = ['openid', 'email'];

  /**
   * The logger factory used for logging.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $loggerFactory;

  /**
   * The datetime.time service.
   *
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $dateTime;

  /**
   * Page cache kill switch.
   *
   * @var \Drupal\Core\PageCache\ResponsePolicy\KillSwitch
   */
  protected $pageCacheKillSwitch;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The OpenID state token service.
   *
   * @var \Drupal\openid_connect\OpenIDConnectStateTokenInterface
   */
  protected $stateToken;

  /**
   * The constructor.
   *
   * @param array $configuration
   *   The plugin configuration.
   * @param string $plugin_id
   *   The plugin identifier.
   * @param mixed $plugin_definition
   *   The plugin definition.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   * @param \GuzzleHttp\ClientInterface $http_client
   *   The http client.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger_factory
   *   The logger factory.
   * @param \Drupal\Component\Datetime\TimeInterface $datetime_time
   *   The datetime.time service.
   * @param \Drupal\Core\PageCache\ResponsePolicy\KillSwitch $page_cache_kill_switch
   *   Policy evaluating to static::DENY when the kill switch was triggered.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\openid_connect\OpenIDConnectStateTokenInterface $state_token
   *   The OpenID state token service.
   */
  public function __construct(
      array $configuration,
      $plugin_id,
      $plugin_definition,
      RequestStack $request_stack,
      ClientInterface $http_client,
      LoggerChannelFactoryInterface $logger_factory,
      // @todo Remove the NULLs in version 2.0 of the module.
      TimeInterface $datetime_time = NULL,
      KillSwitch $page_cache_kill_switch = NULL,
      LanguageManagerInterface $language_manager = NULL,
      OpenIDConnectStateTokenInterface $state_token = NULL
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);

    $this->requestStack = $request_stack;
    $this->httpClient = $http_client;
    $this->loggerFactory = $logger_factory;
    $this->dateTime = $datetime_time ?: \Drupal::time();
    $this->pageCacheKillSwitch = $page_cache_kill_switch ?: \Drupal::service('page_cache_kill_switch');
    $this->languageManager = $language_manager ?: \Drupal::languageManager();
    $this->stateToken = $state_token ?: \Drupal::service('openid_connect.state_token');
    $this->setConfiguration($configuration);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(
      ContainerInterface $container,
      array $configuration,
      $plugin_id,
      $plugin_definition
  ) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('request_stack'),
      $container->get('http_client'),
      $container->get('logger.factory'),
      $container->get('datetime.time'),
      $container->get('page_cache_kill_switch'),
      $container->get('language_manager'),
      $container->get('openid_connect.state_token')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getConfiguration() {
    return $this->configuration;
  }

  /**
   * {@inheritdoc}
   */
  public function setConfiguration(array $configuration) {
    $this->configuration = NestedArray::mergeDeep(
      $this->defaultConfiguration(),
      $configuration
    );
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'client_id' => '',
      'client_secret' => '',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function calculateDependencies() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state) {
    $form['redirect_url'] = [
      '#title' => $this->t('Redirect URL'),
      '#type' => 'item',
      '#markup' => $this->getRedirectUrl()->toString(),
    ];
    $form['client_id'] = [
      '#title' => $this->t('Client ID'),
      '#type' => 'textfield',
      '#default_value' => $this->configuration['client_id'],
    ];
    $form['client_secret'] = [
      '#title' => $this->t('Client secret'),
      '#type' => 'textarea',
      '#default_value' => $this->configuration['client_secret'],
    ];
    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function getClientScopes() {
    return $this->clientScopes;
  }

  /**
   * {@inheritdoc}
   */
  public function validateConfigurationForm(array &$form, FormStateInterface $form_state) {
    // Provider label as array for StringTranslationTrait::t() argument.
    $provider = [
      '@provider' => $this->getPluginDefinition()['label'],
    ];

    // Get plugin setting values.
    $configuration = $form_state->getValues();

    // Whether a client ID is given.
    if (empty($configuration['client_id'])) {
      $form_state->setErrorByName('client_id', $this->t('The client ID is missing for @provider.', $provider));
    }
    // Whether a client secret is given.
    if (empty($configuration['client_secret'])) {
      $form_state->setErrorByName('client_secret', $this->t('The client secret is missing for @provider.', $provider));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state) {
    // No need to do anything, but make the function have a body anyway
    // so that it's callable by overriding methods.
  }

  /**
   * {@inheritdoc}
   */
  public function authorize($scope = 'openid email') {
    $redirect_uri = $this->getRedirectUrl()->toString(TRUE);
    $url_options = $this->getUrlOptions($scope, $redirect_uri);

    $endpoints = $this->getEndpoints();
    // Clear _GET['destination'] because we need to override it.
    $this->requestStack->getCurrentRequest()->query->remove('destination');
    $authorization_endpoint = Url::fromUri($endpoints['authorization'], $url_options)->toString(TRUE);

    $response = new TrustedRedirectResponse($authorization_endpoint->getGeneratedUrl());
    // We can't cache the response, since this will prevent the state to be
    // added to the session. The kill switch will prevent the page getting
    // cached for anonymous users when page cache is active.
    $this->pageCacheKillSwitch->trigger();

    return $response;
  }

  /**
   * Helper function for URL options.
   *
   * @param string $scope
   *   A string of scopes.
   * @param \Drupal\Core\GeneratedUrl $redirect_uri
   *   URI to redirect for authorization.
   *
   * @return array
   *   Array with URL options.
   */
  protected function getUrlOptions($scope, GeneratedUrl $redirect_uri) {
    return [
      'query' => [
        'client_id' => $this->configuration['client_id'],
        'response_type' => 'code',
        'scope' => $scope,
        'redirect_uri' => $redirect_uri->getGeneratedUrl(),
        'state' => $this->stateToken->create(),
      ],
    ];
  }

  /**
   * Helper function for request options.
   *
   * @param string $authorization_code
   *   Authorization code received as a result of the the authorization request.
   * @param string $redirect_uri
   *   URI to redirect for authorization.
   *
   * @return array
   *   Array with request options.
   */
  protected function getRequestOptions($authorization_code, $redirect_uri) {
    return [
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
  }

  /**
   * {@inheritdoc}
   */
  public function retrieveTokens($authorization_code) {
    // Exchange `code` for access token and ID token.
    $redirect_uri = $this->getRedirectUrl()->toString();
    $endpoints = $this->getEndpoints();
    $request_options = $this->getRequestOptions($authorization_code, $redirect_uri);

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
        $tokens['expire'] = $this->dateTime->getRequestTime() + $response_data['expires_in'];
      }
      if (array_key_exists('refresh_token', $response_data)) {
        $tokens['refresh_token'] = $response_data['refresh_token'];
      }
      return $tokens;
    }
    catch (\Exception $e) {
      $variables = [
        '@message' => 'Could not retrieve tokens',
        '@error_message' => $e->getMessage(),
      ];

      if ($e instanceof RequestException && $e->hasResponse()) {
        $response_body = $e->getResponse()->getBody()->getContents();
        $variables['@error_message'] .= ' Response: ' . $response_body;
      }

      $this->loggerFactory->get('openid_connect_' . $this->pluginId)
        ->error('@message. Details: @error_message', $variables);
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function decodeIdToken($id_token) {
    list(, $claims64,) = explode('.', $id_token);
    $claims64 = str_replace(['-', '_'], ['+', '/'], $claims64);
    $claims64 = base64_decode($claims64);
    return json_decode($claims64, TRUE);
  }

  /**
   * {@inheritdoc}
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

      return json_decode($response_data, TRUE);
    }
    catch (\Exception $e) {
      $variables = [
        '@message' => 'Could not retrieve user profile information',
        '@error_message' => $e->getMessage(),
      ];

      if ($e instanceof RequestException && $e->hasResponse()) {
        $response_body = $e->getResponse()->getBody()->getContents();
        $variables['@error_message'] .= ' Response: ' . $response_body;
      }

      $this->loggerFactory->get('openid_connect_' . $this->pluginId)
        ->error('@message. Details: @error_message', $variables);
      return FALSE;
    }
  }

  /**
   * Returns the redirect URL.
   *
   * @param array $route_parameters
   *   See \Drupal\Core\Url::fromRoute() for details.
   * @param array $options
   *   See \Drupal\Core\Url::fromRoute() for details.
   *
   * @return \Drupal\Core\Url
   *   A new Url object for a routed (internal to Drupal) URL.
   *
   * @see \Drupal\Core\Url::fromRoute()
   */
  protected function getRedirectUrl(array $route_parameters = [], array $options = []) {
    $language_none = $this->languageManager
      ->getLanguage(LanguageInterface::LANGCODE_NOT_APPLICABLE);

    $route_parameters += [
      'client_name' => $this->pluginId,
    ];
    $options += [
      'absolute' => TRUE,
      'language' => $language_none,
    ];
    return Url::fromRoute('openid_connect.redirect_controller_redirect', $route_parameters, $options);
  }

}
