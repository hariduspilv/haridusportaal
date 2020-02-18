<?php

namespace Drupal\adv_varnish\Cache;

use Drupal\Core\Cache\CacheTagsInvalidatorInterface;

/**
 * Class AdvancedVarnishCacheTagsInvalidator.
 */
class VarnishAdvCacheTagsInvalidator implements CacheTagsInvalidatorInterface {

  /**
   * Marks cache items with any of the specified tags as invalid.
   *
   * @param string[] $tags
   *   The list of tags for which to invalidate cache items.
   */
  public function invalidateTags(array $tags) {
    \Drupal::service('adv_varnish.handler')->purgeTags($tags);
  }

}
