<?php

namespace Drupal\adv_varnish\EventSubscriber;

use Drupal\adv_varnish\Controller\VarnishAdvController;
use Drupal\Core\Cache\CacheableResponseInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Drupal\Core\EventSubscriber\FinishResponseSubscriber;
use Drupal\Core\Cache\Context\CacheContextsManager;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\PageCache\RequestPolicyInterface;
use Drupal\Core\PageCache\ResponsePolicyInterface;

/**
 * Event subscriber class.
 */
class AdvCacheableResponseSubscriber extends FinishResponseSubscriber {

  /**
   * Varnish controller
   *
   * @var \Drupal\adv_varnish\Controller\VarnishAdvController
   */
  protected $controller;

  /**
   * Constructs a FinishResponseSubscriber object.
   *
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager object for retrieving the correct language code.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   A config factory for retrieving required config objects.
   * @param \Drupal\Core\PageCache\RequestPolicyInterface $request_policy
   *   A policy rule determining the cacheability of a request.
   * @param \Drupal\Core\PageCache\ResponsePolicyInterface $response_policy
   *   A policy rule determining the cacheability of a response.
   * @param \Drupal\Core\Cache\Context\CacheContextsManager $cache_contexts_manager
   *   The cache contexts manager service.
   * @param \Drupal\adv_varnish\Controller\VarnishAdvController $controller
   *   Varnish controller.
   * @param bool $http_response_debug_cacheability_headers
   *   (optional) Whether to send cacheability headers for debugging purposes.
   */
  public function __construct(LanguageManagerInterface $language_manager, ConfigFactoryInterface $config_factory, RequestPolicyInterface $request_policy, ResponsePolicyInterface $response_policy, CacheContextsManager $cache_contexts_manager, VarnishAdvController $controller, $http_response_debug_cacheability_headers = FALSE) {
    parent::__construct($language_manager, $config_factory, $request_policy, $response_policy, $cache_contexts_manager, $http_response_debug_cacheability_headers);
    $this->controller = $controller;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['onRespond'];
    return $events;
  }

  /**
   * Response event handler.
   *
   * @param \Symfony\Component\HttpKernel\Event\FilterResponseEvent $event
   *   Process Response.
   */
  public function onRespond(FilterResponseEvent $event) {
    if (!$event->isMasterRequest()) {
      return;
    }

    $request = $event->getRequest();
    $response = $event->getResponse();

    // Set the Content-language header.
    $response->headers->set('Content-language', $this->languageManager->getCurrentLanguage()->getId());

    $is_cacheable = $this->controller->cachingEnabled();

    // Inform Varnish about ESI.
    if ($this->controller->esiEnabled()) {
      $response->headers->set(VarnishAdvController::ADV_VARNISH_X_DOESI, 'YES', FALSE);
    }

    // Add headers necessary to specify whether the response should be cached by
    // proxies and/or the browser.
    if ($is_cacheable && $response instanceof CacheableResponseInterface && $this->config->get('cache.page.max_age') > 0) {
      // Set Cacheable response.
      $this->setResponseCacheable($response, $request);
      // Update Cache-Control Headers in case ESI elements.
      if ($this->controller->esiEnabled()) {
        $response->headers->set('Cache-Control', 'no-cache, no-store');
      }
      $this->controller->handleResponseEvent($event);
    }
    else {
      // If either the policy forbids caching or the sites configuration does
      // not allow to add a max-age directive, then enforce a Cache-Control
      // header declaring the response as not cacheable.
      $this->setResponseNotCacheable($response, $request);
      $response->headers->set('X-Pass-Varnish', 'YES', FALSE);
    }
  }

}
