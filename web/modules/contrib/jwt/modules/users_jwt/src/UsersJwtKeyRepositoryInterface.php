<?php

namespace Drupal\users_jwt;

/**
 * Interface UsersJwtKeyRepositoryInterface
 *
 * This extends \ArrayAccess so that the repository service can be passed as
 * the $key argument to \Firebase\JWT\JWT::decode().
 */
interface UsersJwtKeyRepositoryInterface extends \ArrayAccess {

  /**
   * Get a user key by key ID.
   *
   * @param string $id
   *   The unique ID of the key.
   *
   * @return \Drupal\users_jwt\UsersKey|null
   *   Key data object, or NULL if no matching key was found.
   */
  public function getKey($id): ?UsersKey;

  /**
   * Save a key for a user account.
   *
   * @param int $uid
   *   The user account ID the data is associated with.
   * @param string $id
   *   The unique name of the key.
   * @param string $alg
   *   The JWT algorithm to use. e.g. 'RS256'.
   * @param string $pubkey
   *   The value to store.
   *
   * @return \Drupal\users_jwt\UsersKey
   *   The values of the key that were saved.
   *
   * @throws \InvalidArgumentException If the $id is empty or used by another user (i.e. not unique).
   */
  public function saveKey($uid, $id, $alg, $pubkey): UsersKey;

  /**
   * Delete one key.
   *
   * @param string $id
   *   The key ID.
   */
  public function deleteKey($id);

  /**
   * Delete all keys for one user.
   *
   * @param int $uid
   *   The user ID.
   */
  public function deleteUsersKeys($uid);

  /**
   * Return all keys for one user.
   *
   * @param int $uid
   *   The user ID.
   *
   * @return array
   *   The key objects, indexed by key ID.
   */
  public function getUsersKeys($uid): array;

  /**
   * Get options for supported algorithms.
   *
   * @return \Drupal\Core\StringTranslation\TranslatableMarkup[]
   *   Keys are JWT alg options, value is localized string object.
   */
  public function algorithmOptions(): array;

  /**
   * Extends \ArrayAccess::offsetGet().
   *
   * @param string $id
   *   A key ID.
   *
   * @return string|null
   *   The public key for a key ID, or null if there is no such key.
   */
  public function offsetGet($id);

}
