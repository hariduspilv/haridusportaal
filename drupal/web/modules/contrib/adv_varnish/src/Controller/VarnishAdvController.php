<?php

namespace Drupal\adv_varnish\Controller;

use Drupal\adv_varnish\VarnishInterface;
use Drupal\Core\Routing\AdminContext;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\StreamWrapper\PrivateStream;
use Drupal\Core\StreamWrapper\PublicStream;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Drupal\Core\Routing\LocalRedirectResponse;

/**
 * Main Varnish controller.
 *
 * Middleware stack controller to serve Cacheable response.
 */
class VarnishAdvController {

  // Set header const.
  const ADV_VARNISH_HEADER_CACHE_TAG = 'X-Tag';
  const ADV_VARNISH_HEADER_GRACE = 'X-Grace';
  const ADV_VARNISH_HEADER_CACHE_DEBUG = 'X-Cache-Debug';
  const ADV_VARNISH_HEADER_BIN_ROLE_DEBUG = 'X-Bin-Role';
  const ADV_VARNISH_COOKIE_BIN = 'COMBIN';
  const ADV_VARNISH_COOKIE_INF = 'COMINF';
  const ADV_VARNISH_X_TTL = 'X-TTL';
  const ADV_VARNISH_X_DOESI = 'X-DOESI';

  /**
   * Stores the state storage service.
   *
   * @var \Drupal\adv_varnish\VarnishInterface
   */
  protected $varnishHandler;

  /**
   * Reload variable.
   *
   * @var bool
   */
  protected $needsReload;

  /**
   * Drupal request.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $request;

  /**
   * User account interface.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $account;

  /**
   * The route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * The route admin context to determine whether a route is an admin one.
   *
   * @var \Drupal\Core\Routing\AdminContext
   */
  protected $adminContext;

  /**
   * @var object|null handle the Response object.
   */
  protected $response;

  /**
   * VarnishAdvController constructor.
   *
   * @param \Drupal\adv_varnish\VarnishInterface $varnishHandler
   *   Varnish handler object.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request
   *   Request stack service.
   * @param \Drupal\Core\Session\AccountProxyInterface $account
   *   The current account.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   * @param \Drupal\Core\Routing\AdminContext $admin_context
   *   The route admin context to determine whether the route is an admin one.
   */
  public function __construct(VarnishInterface $varnishHandler, RequestStack $request, AccountProxyInterface $account, RouteMatchInterface $route_match, AdminContext $admin_context) {
    $this->varnishHandler = $varnishHandler;
    $this->account = $account;
    $this->request = $request->getCurrentRequest();
    $this->routeMatch = $route_match;
    $this->adminContext = $admin_context;
  }

  /**
   * Response event handler.
   */
  public function handleResponseEvent(FilterResponseEvent $event) {
    $this->response = $event->getResponse();
    // Update cookie.
    $this->cookieUpdate();
    // Reload page with updated cookies if needed.
    $needs_update = $this->needsReload && !($this->response instanceof LocalRedirectResponse) ?: FALSE;
    if ($needs_update) {
      $this->reload();
    }
    // Get entity specific settings.
    $cache_settings = $this->getCacheSettings();
    // Set headers.
    $this->setResponseHeaders($cache_settings);
  }

  /**
   * Set varnish specific response headers.
   */
  protected function setResponseHeaders($cache_settings) {
    // If response not sets
    // Get debug settings.
    $debug_mode = $this->varnishHandler->getSettings('general.debug');
    // And check if we need to enable debug mode.
    if ($debug_mode) {
      $this->response->headers->set(static::ADV_VARNISH_HEADER_CACHE_DEBUG, '1');
    }

    // Set response headers.
    $this->response->headers->set(static::ADV_VARNISH_HEADER_GRACE, $cache_settings['grace']);
    $this->response->headers->set(static::ADV_VARNISH_HEADER_CACHE_TAG, implode(';', $cache_settings['tags']) . ';');
    $this->response->headers->set(static::ADV_VARNISH_X_TTL, $cache_settings['ttl']);
  }

  /**
   * Reload page with updated cookies.
   */
  protected function reload() {
    // Setting cookie will prevent varnish from caching this.
    setcookie('time', time(), NULL, '/');
    // Get path.
    $path = $this->request->getRequestUri();
    // Create new response.
    $newResponse = new RedirectResponse($path);
    // Send response.
    $newResponse->send();
     return FALSE;
  }

  /**
   * Updates cookie if required.
   */
  protected function cookieUpdate() {
    // Cookies may be disabled for resource files,
    // so no need to redirect in such a case.
    if ($this->redirectForbidden()) {
      return;
    }

    if ($this->account->hasPermission('bypass advanced varnish cache')) {
      $cookie_inf = 'bypass_varnish';
      $cookie_bin = hash('sha256', $cookie_inf);
    }
    elseif ($this->account->id() > 0) {
      $roles = $this->account->getRoles();
      sort($roles);
      $bin = implode('__', $roles);
      // Set cookie inf.
      $cookie_inf = $bin;
      // Hash bin (PER_ROLE-PER_PAGE).
      $cookie_bin = hash('sha256', $bin);
    }
    else {
      // Bin for anon user.
      $cookie_inf = $cookie_bin = '';
    }

    // Set BIN header for debug.
    if ($this->response && $this->varnishHandler->getSettings('general.debug')) {
      $this->response->headers->set(static::ADV_VARNISH_HEADER_BIN_ROLE_DEBUG, $cookie_inf);
    }

    // Update cookies if did not match.
    $old_cookie = $_COOKIE[static::ADV_VARNISH_COOKIE_BIN] ?? '';
    if ($old_cookie != $cookie_bin) {

      // Update cookies.
      $params = session_get_cookie_params();
      $expire = $params['lifetime'] ? (REQUEST_TIME + $params['lifetime']) : 0;
      setcookie(static::ADV_VARNISH_COOKIE_BIN, $cookie_bin, $expire, $params['path'], $params['domain'], FALSE, $params['httponly']);
      setcookie(static::ADV_VARNISH_COOKIE_INF, $cookie_inf, $expire, $params['path'], $params['domain'], FALSE, $params['httponly']);

      // Reload the page to apply new cookie.
      $this->needsReload = TRUE;
    }
  }

  /**
   * Check if redirect enabled.
   *
   * Check if this page is allowed to redirect,
   * be default resource files should not be redirected.
   */
  public function redirectForbidden() {
    if ((!empty($_SESSION['adv_varnish__redirect_forbidden']))
      || ($this->varnishHandler->getSettings('redirect_forbidden'))
      || ($this->varnishHandler->getSettings('redirect_forbidden_no_cookie') && empty($_COOKIE))) {
      // This one is important as search engines don't have cookie support
      // and we don't want them to enter infinite loop.
      // Also images may have their cookies be stripped at Varnish level.
      return TRUE;
    }

    // Get current path as default.
    $current_path = $this->request->getRequestUri();

    // By default exclude resource path.
    $path_to_exclude = [
      PublicStream::basePath(),
      PrivateStream::basePath(),
      file_directory_temp(),
    ];
    $path_to_exclude = array_filter($path_to_exclude, 'trim');

    // Check against excluded path.
    $forbidden = FALSE;
    foreach ($path_to_exclude as $exclude) {
      if (strpos($current_path, $exclude) === 0) {
        $forbidden = TRUE;
      }
    }

    return $forbidden;
  }

  /**
   * Specific entity cache settings getter.
   */
  public function getCacheSettings() {
    $cache_settings['grace'] = $this->varnishHandler->getSettings('general.grace');
    // Load $cacheable data from response.
    $cacheable = $this->response->getCacheableMetadata();
    // Define tags.
    $cache_settings['tags'] = $cacheable->getCacheTags();
    // Set ttl.
    $cache_settings['ttl'] = $this->varnishHandler->getSettings('general.page_cache_maximum_age');
    // Get cache control header.
    $cache_settings['cache_control'] = $this->varnishHandler->getSettings('cache_control');
    // Return settings.
    return $cache_settings;
  }

  /**
   * Define if caching enabled for the page and we can proceed with the request.
   *
   * @return bool
   *   Result of varnish enable state.
   */
  public function cachingEnabled() {

    if (!$this->varnishHandler->getSettings('general.enabled')) {
      return FALSE;
    }

    // Disable varnish for admin pages.
    if ($this->adminContext->isAdminRoute($this->routeMatch->getRouteObject())) {
      return FALSE;
    }

    // Check if user is authenticated and we can use cache for such users.
    $authenticated = $this->account->isAuthenticated();
    $cache_authenticated = $this->varnishHandler->getSettings('available.authenticated_users');
    if ($authenticated && !$cache_authenticated) {
      $this->cookieUpdate();
      return FALSE;
    }

    // Check if user has permission to bypass varnish.
    if ($this->account->hasPermission('bypass advanced varnish cache')) {
      $this->cookieUpdate();
      return FALSE;
    }

    // Check if we acn be on disabled domain.
    $config = explode(PHP_EOL, $this->varnishHandler->getSettings('available.exclude'));
    foreach ($config as $line) {
      $rule = explode('|', trim($line));
      if ((($rule[0] == '*') || ($_SERVER['SERVER_NAME'] == $rule[0]))
          && (($rule[1] == '*') || strpos($_SERVER['REQUEST_URI'], $rule[1]) === 0)) {
        return FALSE;
      }
    }

    return TRUE;
  }

  /**
   * Define if esi enabled for this page.
   *
   * @return bool
   *   ESI enable state.
   */
  public function esiEnabled() {
    if (!$this->varnishHandler->getSettings('general.esi')) {
      return FALSE;
    }

    if ($this->request->getRequestUri() == '/adv_varnish/userdata') {
      return FALSE;
    }
    return TRUE;
  }

}
