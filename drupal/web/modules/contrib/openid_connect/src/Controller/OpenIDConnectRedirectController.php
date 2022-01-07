<?php

namespace Drupal\openid_connect\Controller;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Routing\Access\AccessInterface;
use Drupal\Core\Url;
use Drupal\openid_connect\Plugin\OpenIDConnectClientManager;
use Drupal\openid_connect\Plugin\OpenIDConnectClientInterface;
use Drupal\openid_connect\OpenIDConnect;
use Drupal\openid_connect\OpenIDConnectStateTokenInterface;
use Drupal\user\UserInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Redirect controller.
 *
 * @package Drupal\openid_connect\Controller
 */
class OpenIDConnectRedirectController extends ControllerBase implements AccessInterface {

  /**
   * The OpenID client plugin manager.
   *
   * @var \Drupal\openid_connect\Plugin\OpenIDConnectClientManager
   */
  protected $pluginManager;

  /**
   * The OpenID state token service.
   *
   * @var \Drupal\openid_connect\OpenIDConnectStateTokenInterface
   */
  protected $stateToken;

  /**
   * The request stack used to access request globals.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The logger factory.
   *
   * @var \Drupal\Core\Logger\LoggerChannelFactoryInterface
   */
  protected $loggerFactory;

  /**
   * The OpenID Connect service.
   *
   * @var \Drupal\openid_connect\OpenIDConnect
   */
  protected $openIDConnect;

  /**
   * The constructor.
   *
   * @param \Drupal\openid_connect\Plugin\OpenIDConnectClientManager $plugin_manager
   *   The OpenID client plugin manager.
   * @param \Drupal\openid_connect\OpenIDConnect $openid_connect
   *   The OpenID Connect service.
   * @param \Drupal\openid_connect\OpenIDConnectStateTokenInterface $state_token
   *   The OpenID state token service.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   * @param \Drupal\Core\Logger\LoggerChannelFactoryInterface $logger_factory
   *   The logger factory.
   */
  public function __construct(
    OpenIDConnectClientManager $plugin_manager,
    OpenIDConnect $openid_connect,
    OpenIDConnectStateTokenInterface $state_token,
    RequestStack $request_stack,
    LoggerChannelFactoryInterface $logger_factory
  ) {
    $this->pluginManager = $plugin_manager;
    $this->openIDConnect = $openid_connect;
    $this->stateToken = $state_token;
    $this->requestStack = $request_stack;
    $this->loggerFactory = $logger_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('plugin.manager.openid_connect_client'),
      $container->get('openid_connect.openid_connect'),
      $container->get('openid_connect.state_token'),
      $container->get('request_stack'),
      $container->get('logger.factory')
    );
  }

  /**
   * Access callback: Redirect page.
   *
   * @return \Drupal\Core\Access\AccessResultInterface
   *   Whether the state token matches the previously created one that is stored
   *   in the session.
   */
  public function access() {
    // Confirm anti-forgery state token. This round-trip verification helps to
    // ensure that the user, not a malicious script, is making the request.
    $request = $this->requestStack->getCurrentRequest();
    $state_token = $request->get('state');
    if ($state_token && $this->stateToken->confirm($state_token)) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * Redirect.
   *
   * @param string $client_name
   *   The client name.
   *
   * @return \Symfony\Component\HttpFoundation\RedirectResponse
   *   The redirect response starting the authentication request.
   */
  public function authenticate($client_name) {
    $request = $this->requestStack->getCurrentRequest();

    // Delete the state token, since it's already been confirmed.
    unset($_SESSION['openid_connect_state']);

    // Get parameters from the session, and then clean up.
    $parameters = [
      'destination' => 'user',
      'op' => 'login',
      'connect_uid' => NULL,
    ];
    foreach ($parameters as $key => $default) {
      if (isset($_SESSION['openid_connect_' . $key])) {
        $parameters[$key] = $_SESSION['openid_connect_' . $key];
        unset($_SESSION['openid_connect_' . $key]);
      }
    }
    $destination = $parameters['destination'];

    $configuration = $this->config('openid_connect.settings.' . $client_name)
      ->get('settings');
    $client = $this->pluginManager->createInstance(
      $client_name,
      $configuration
    );
    if (!$request->get('error') && (!($client instanceof OpenIDConnectClientInterface) || !$request->get('code'))) {
      // In case we don't have an error, but the client could not be loaded or
      // there is no state token specified, the URI is probably being visited
      // outside of the login flow.
      throw new NotFoundHttpException();
    }

    $provider_param = ['@provider' => $client->getPluginDefinition()['label']];

    if ($request->get('error')) {
      if (in_array($request->get('error'), [
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
          '@error' => $request->get('error'),
          '@details' => $request->get('error_description') ? $request->get('error_description') : $this->t('Unknown error.'),
        ];
        $message = 'Authorization failed: @error. Details: @details';
        $this->loggerFactory->get('openid_connect_' . $client_name)->error($message, $variables);
        $this->messenger()->addError($this->t('Could not authenticate with @provider.', $provider_param));
      }
    }
    else {
      // Process the login or connect operations.
      $tokens = $client->retrieveTokens($request->get('code'));
      if ($tokens) {
        if ($parameters['op'] === 'login') {
          $success = $this->openIDConnect->completeAuthorization($client, $tokens, $destination);

          if (!$success) {
            // Check Drupal user register settings before saving.
            $register = $this->config('user.settings')->get('register');
            // Respect possible override from OpenID-Connect settings.
            $register_override = $this->config('openid_connect.settings')
              ->get('override_registration_settings');
            if ($register === UserInterface::REGISTER_ADMINISTRATORS_ONLY && $register_override) {
              $register = UserInterface::REGISTER_VISITORS;
            }

            switch ($register) {
              case UserInterface::REGISTER_ADMINISTRATORS_ONLY:
              case UserInterface::REGISTER_VISITORS_ADMINISTRATIVE_APPROVAL:
                // Skip creating an error message, as completeAuthorization
                // already added according messages.
                break;

              default:
                $this->messenger()->addError($this->t('Logging in with @provider could not be completed due to an error.', $provider_param));
                break;
            }
          }
        }
        elseif ($parameters['op'] === 'connect' && $parameters['connect_uid'] === $this->currentUser()->id()) {
          $success = $this->openIDConnect->connectCurrentUser($client, $tokens);
          if ($success) {
            $this->messenger()->addMessage($this->t('Account successfully connected with @provider.', $provider_param));
          }
          else {
            $this->messenger()->addError($this->t('Connecting with @provider could not be completed due to an error.', $provider_param));
          }
        }
      }
      else {
        $this->messenger()->addError($this->t('Failed to get authentication tokens for @provider. Check logs for further details.', $provider_param));
      }
    }

    // It's possible to set 'options' in the redirect destination.
    if (is_array($destination)) {
      $query = !empty($destination[1]['query']) ? '?' . $destination[1]['query'] : '';
      $redirect = Url::fromUri('internal:/' . ltrim($destination[0], '/') . $query)->toString();
    }
    else {
      $redirect = Url::fromUri('internal:/' . ltrim($destination, '/'))->toString();
    }
    return new RedirectResponse($redirect);
  }

}
