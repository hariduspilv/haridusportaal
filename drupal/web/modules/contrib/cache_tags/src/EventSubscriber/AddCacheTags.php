<?php

namespace Drupal\cache_tags\EventSubscriber;

/**
 * @file
 * Contains \Drupal\cache_tags\EventSubscriber\AddCacheTags.
 */
use Drupal\Core\Cache\CacheableResponseInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Provides AddCacheTags.
 */
class AddCacheTags implements EventSubscriberInterface, ContainerInjectionInterface {

  /** @var \Drupal\Core\Config\ImmutableConfig */
  protected $config;

  /**
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   */
  public function __construct(ConfigFactoryInterface $config_factory) {
    $this->config = $config_factory->get('cache_tags.settings');
  }

  /**
   * @inheritDoc
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory')
    );
  }

  /**
   * Sets extra HTTP headers.
   */
  public function onRespond(ResponseEvent $event) {
    if (!$event->isMasterRequest()) {
      return;
    }

    $response = $event->getResponse();
    if ($response instanceof CacheableResponseInterface) {
      // Get all cache tags for the request.
      $tags = $response->getCacheableMetadata()->getCacheTags();

      // Read cacheTags settings.
      // Get cacheTags name.
      if (NULL !== $this->config->get('CacheTagsName')) {
        $cacheTagsName = trim($this->config->get('CacheTagsName'));
      }
      else {
        $cacheTagsName = 'Cache-Tags';
      }
      // Get cacheTags delimiter.
      if (NULL !== $this->config->get('Delimiter')) {
        $delimiter = trim($this->config->get('Delimiter'));
      }
      if (!isset($delimiter)) {
        $delimiter = '[space]';
      }
      $delimiter = str_replace("[space]", " ", $delimiter);
      $delimiter = str_replace("[comma]", ",", $delimiter);
      // Outputs the header.
      $response->headers->set($cacheTagsName, implode($delimiter, $tags));
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::RESPONSE][] = ['onRespond'];
    return $events;
  }

}
