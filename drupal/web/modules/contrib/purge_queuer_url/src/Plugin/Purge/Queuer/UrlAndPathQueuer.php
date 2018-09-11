<?php

namespace Drupal\purge_queuer_url\Plugin\Purge\Queuer;

use Symfony\Component\DependencyInjection\ContainerAwareInterface;
use Symfony\Component\DependencyInjection\ContainerAwareTrait;
use Drupal\Component\Plugin\Exception\PluginNotFoundException;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\purge\Plugin\Purge\Invalidation\Exception\TypeUnsupportedException;

/**
 * Queues URLs or paths when Drupal invalidates cache tags.
 */
class UrlAndPathQueuer implements CacheTagsInvalidatorInterface, ContainerAwareInterface {
  use ContainerAwareTrait;

  /**
   * A list of tags that have already been invalidated in this request.
   *
   * Used to prevent the invalidation of the same cache tag multiple times.
   *
   * @var string[]
   */
  protected $invalidatedTags = [];

  /**
   * Purge's invalidation object factory.
   *
   * @var null|\Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface
   */
  protected $purgeInvalidationFactory;

  /**
   * Purge's queue service.
   *
   * @var null|Drupal\purge\Plugin\Purge\Queue\QueueServiceInterface
   */
  protected $purgeQueue;

  /**
   * The traffic registry with the stored URLs and tags.
   *
   * @var null|\Drupal\purge_queuer_url\TrafficRegistryInterface
   */
  protected $registry;

  /**
   * The queuer plugin or FALSE when the plugin is disabled.
   *
   * @var false|\Drupal\purge_queuer_url\Plugin\Purge\Queuer\UrlAndPathQueuerPlugin
   */
  protected $queuer;

  /**
   * Initialize the invalidation factory and queue service.
   *
   * @return bool
   *   TRUE when everything is available, FALSE when our plugin is disabled.
   */
  protected function initialize() {
    if (is_null($this->queuer)) {

      // Attempt to load the urlpath queuer plugin, when it fails it is disabled.
      $this->queuer = $this->container->get('purge.queuers')->get('urlpath');

      if ($this->queuer !== FALSE) {
        $this->purgeInvalidationFactory = $this->container->get('purge.invalidation.factory');
        $this->purgeQueue = $this->container->get('purge.queue');
        $this->registry = $this->container->get('purge_queuer_url.registry');
      }
    }
    return $this->queuer !== FALSE;
  }

  /**
   * {@inheritdoc}
   *
   * Queues invalidated cache tags as tag purgables.
   */
  public function invalidateTags(array $tags) {
    if (!$this->initialize()) {
      return;
    }

    // Remove tags to lookup that have already been invalidated during runtime.
    foreach ($tags as $i => $tag) {
      if (in_array($tag, $this->invalidatedTags)) {
        unset($tags[$i]);
      }
    }

    // When there are still tags left, attempt to lookup URLs and queue them.
    if (count($tags)) {
      if ($urls_and_paths = $this->registry->getUrls($tags)) {
        $invalidations = [];

        // Iterate the matches and add URL or Path invalidations correspondingly.
        foreach ($urls_and_paths as $url_or_path) {
          $invalidation_type = strpos($url_or_path, '://') ? 'url' : 'path';
          try {
            $invalidations[] = $this->purgeInvalidationFactory
              ->get($invalidation_type, $url_or_path);
          }
          catch (TypeUnsupportedException $e) {
            // When there's no purger enabled for it, don't bother queuing URLs.
            return;
          }
          catch (PluginNotFoundException $e) {
            // When Drupal uninstalls Purge, rebuilds plugin caches it might
            // run into the condition where the tag plugin isn't available. In
            // these scenarios we want the queuer to silently fail.
            return;
          }
        }

        // Queue the invalidations and mark the tags to prevent duplicates.
        if (count($invalidations)) {
          foreach ($tags as $tag) {
            $this->invalidatedTags[] = $tag;
          }

          // The invalidations now go in purge's queue buffer, we're done!
          $this->purgeQueue->add($this->queuer, $invalidations);
        }
      }
    }
  }

}
