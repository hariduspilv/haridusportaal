<?php

namespace Drupal\users_jwt;

use Drupal\Core\Cache\CacheBackendInterface;
use Drupal\Core\Cache\CacheTagsInvalidatorInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\user\UserDataInterface;

/**
 * Class UsersJwtKeyRepository
 */
class UsersJwtKeyRepository implements UsersJwtKeyRepositoryInterface {
  use StringTranslationTrait;

  /**
   * The user data service.
   *
   * @var \Drupal\user\UserDataInterface
   */
  protected $userData;

  /**
   * The memory cache.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface
   */
  protected $keyCache;

  /**
   * Cache tags invalidator service.
   *
   * @var \Drupal\Core\Cache\CacheTagsInvalidatorInterface
   */
  protected $cacheTagsInvalidator;

  /**
   * Algorithm options.
   *
   * @var array
   */
  protected $options = [];

  /**
   * UsersJwtKeyRepository constructor.
   *
   * @param \Drupal\user\UserDataInterface $user_data
   *   The user data service.
   * @param \Drupal\Core\Cache\CacheBackendInterface $key_memory_cache
   *   A cache for already loaded keys, usually a memory cache (or null cache).
   * @param \Drupal\Core\Cache\CacheTagsInvalidatorInterface $cache_tags_invalidator
   *   Cache tags invalidator service.
   */
  public function __construct(UserDataInterface $user_data, CacheBackendInterface $key_memory_cache, CacheTagsInvalidatorInterface $cache_tags_invalidator) {
    $this->userData = $user_data;
    $this->keyCache = $key_memory_cache;
    $this->cacheTagsInvalidator = $cache_tags_invalidator;
  }

  /**
   * {@inheritdoc}
   */
  public function getKey($id): ?UsersKey {
    $cached = $this->keyCache->get($id);
    if ($cached) {
      $key = $cached->data;
    }
    else {
      $keys = $this->userData->get('users_jwt', NULL, $id);
      // The key ID needs to be unique.
      if (empty($keys) || count($keys) > 1) {
        $key = NULL;
      }
      else {
        $key = end($keys);
      }
      $this->keyCache->set($id, $key);
    }
    return $key;
  }

  /**
   * {@inheritdoc}
   */
  public function saveKey($uid, $id, $alg, $pubkey): UsersKey {
    if (empty($id)) {
      throw new \InvalidArgumentException("Key ID '$id' is empty");
    }
    $keys = $this->userData->get('users_jwt', NULL, $id);
    foreach ($keys as $key_uid => $key_data) {
      if ($key_uid !== $uid) {
        throw new \InvalidArgumentException("Key ID '$id' is already in use by user with uid $key_uid");
      }
    }
    $key = new UsersKey($uid, $id, $alg, $pubkey);
    $this->userData->set('users_jwt', $uid, $id, $key);
    $this->keyCache->delete($id);
    $this->cacheTagsInvalidator->invalidateTags(['users_jwt:' . $uid]);
    return $key;
  }

  /**
   * {@inheritdoc}
   */
  public function deleteKey($id) {
    $keys = $this->userData->get('users_jwt', NULL, $id);
    if ($keys) {
      $this->userData->delete('users_jwt', NULL, $id);
      // There should be only one key, but invalidate for any we found.
      $cache_tags = [];
      foreach ($keys as $key_uid => $key_data) {
        $cache_tags[] = 'users_jwt:' . $key_uid;
      }
      $this->cacheTagsInvalidator->invalidateTags($cache_tags);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function deleteUsersKeys($uid) {
    $this->userData->delete('users_jwt', $uid);
    $this->cacheTagsInvalidator->invalidateTags(['users_jwt:' . $uid]);
  }

  /**
   * {@inheritdoc}
   */
  public function getUsersKeys($uid): array {
    return $this->userData->get('users_jwt', $uid);
  }

  /**
   * {@inheritdoc}
   */
  public function algorithmOptions(): array {
    if (empty($this->options)) {
      $this->options['RS256'] = $this->t('RSA (2048 bits or more)');
    }
    return $this->options;
  }

  /**
   * {@inheritdoc}
   */
  public function offsetExists($offset) {
    return (bool) $this->getKey($offset);
  }

  /**
   * {@inheritdoc}
   */
  public function offsetGet($offset) {
    $key = $this->getKey($offset);
    return $key ? $key->pubkey : NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function offsetSet($offset, $value) {}

  /**
   * {@inheritdoc}
   */
  public function offsetUnset($offset) {}

}
