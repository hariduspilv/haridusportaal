<?php

namespace Drupal\users_jwt;

/**
 * Class UsersKey
 *
 * A simple data object.
 */
class UsersKey  {

  /**
   * The user ID.
   *
   * @var int
   */
  public $uid;

  /**
   * The key ID.
   *
   * @var string
   */
  public $id;

  /**
   * The key algorithm.
   *
   * @var string
   */
  public $alg;

  /**
   * The public key.
   *
   * @var string
   */
  public $pubkey;

  /**
   * UsersKey constructor.
   *
   * @param int $uid
   *   A user ID.
   * @param string $id
   *   A key ID.
   * @param string $alg
   *   A key algorithm like RS256.
   * @param string $pubkey
   *   The value of a public key, e.g. RSA or Ed25519.
   */
  public function __construct($uid = NULL, $id = NULL, $alg = NULL, $pubkey = NULL) {
    if ($uid) {
      $this->uid = (int) $uid;
    }
    if ($id) {
      $this->id = trim((string) $id);
    }
    if ($alg) {
      $this->alg = trim((string) $alg);
    }
    if ($pubkey) {
      $this->pubkey = trim((string) $pubkey);
    }
  }
}
