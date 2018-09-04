<?php

namespace Drupal\adv_varnish\Controller;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Render\HtmlResponse;
use Drupal\Core\Render\Renderer;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Main Varnish controller.
 *
 * Middleware stack controller to serve Cacheable response.
 */
class VarnishAdvEsiController extends ControllerBase implements ContainerInjectionInterface {

  /**
   * Module Handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * Renderer.
   *
   * @var \Drupal\Core\Render\Renderer
   */
  protected $renderer;

  /**
   * VarnishAdvEsiController constructor.
   *
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   Module Handler.
   * @param \Drupal\Core\Render\Renderer $renderer
   *   Renderer.
   */
  public function __construct(ModuleHandlerInterface $moduleHandler, Renderer $renderer) {
    $this->moduleHandler = $moduleHandler;
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('module_handler'),
      $container->get('renderer')
    );
  }

  /**
   * Replacer. General callback for replacing esi elements.
   *
   * @param \Symfony\Component\HttpFoundation\Request $request
   *   Request.
   * @param string $type
   *   Path suffix (/adv-varnish/esi/{ $type }).
   */
  public function esi(Request $request, $type) {
    $response = new HtmlResponse();

    // Get Callback.
    $result = $this->getResultFromImplementations($type);
    if (!empty($result)) {
      $esi_ttl = $this->config('adv_varnish.settings')->get('general.esi_cache_maximum_age');
      $markup = $this->renderer->renderRoot($result);
      $cache = CacheableMetadata::createFromRenderArray($result);
      $response->setContent($markup);
      $response->headers->set('X-Tag', implode(' ', $cache->getCacheTags()));
      $response->headers->set('X-TTL', $esi_ttl ? $esi_ttl : 3600);
      $response->headers->set('Host', $request->getHost());
    }

    $response->send();
    die;
  }

  /**
   * Get Render Array from module Implementations.
   *
   * @param string $type
   *   Path suffix (/adv-varnish/esi/{ $type }).
   *
   * @return array
   *   Render array.
   */
  protected function getResultFromImplementations($type) {
    $implementations = $this->moduleHandler->getImplementations('esi_adv_varnish');
    $result = [];
    foreach ($implementations as $module) {
      $result = $this->moduleHandler->invoke($module, 'esi_adv_varnish', [
        $type,
        $_GET,
      ]);
      if (!empty($result)) {
        return $result;
      }
    }
    return $result;
  }

  /**
   * Get Render Array from callback.
   *
   * @param string $type
   *   Path suffix (/adv-varnish/esi/{ $type }).
   *
   * @return array
   *   Render array.
   */
  protected function getResultFromCallback($type) {
    // TODO.
    return [];
  }

}
