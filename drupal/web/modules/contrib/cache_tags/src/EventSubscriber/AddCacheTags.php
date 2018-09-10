<?php

namespace Drupal\cache_tags\EventSubscriber;

/**
 * @file
 * Contains \Drupal\cache_tags\EventSubscriber\AddCacheTags.
 */


use Symfony\Component\HttpKernel\Event\FilterResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Drupal\Core\Cache\CacheableResponseInterface;

/**
 * Provides AddCacheTags.
 */
class AddCacheTags implements EventSubscriberInterface {

  /**
   * Sets extra HTTP headers.
   */
  public function onRespond(FilterResponseEvent $event) {
    if (!$event->isMasterRequest()) {
      return;
    }

    $response = $event->getResponse();
    if ($response instanceof CacheableResponseInterface) {
      // Get all cache tags for the request.
      $tags = $response->getCacheableMetadata()->getCacheTags();

      $config = \Drupal::config('cache_tags.settings');
      // Read cacheTags settings.
      // Get cacheTags name.
      if (NULL !== $config->get('CacheTagsName')) {
        $cacheTagsName = trim($config->get('CacheTagsName'));
      }
      else {
        $cacheTagsName = 'Cache-Tags';
      }
      // Get cacheTags delimiter.
      if (NULL !== $config->get('Delimiter')) {
        $delimiter = trim($config->get('Delimiter'));
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
