<?php

namespace Drupal\openid_connect;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * The OpenID Connect authmap service.
 *
 * @package Drupal\openid_connect
 */
class OpenIDConnectAuthmap {

  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;

  /**
   * The User entity storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $userStorage;

  /**
   * Constructs a OpenIDConnectAuthmap service object.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   A database connection.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   (optional) The entity manager. (deprecated) Will be mandatory in 2.0.
   */
  public function __construct(Connection $connection, EntityTypeManagerInterface $entity_type_manager = NULL) {
    if ($entity_type_manager === NULL) {
      @trigger_error('The second parameter optionality is deprecated in openid_connect:8.x-1.1 and will be mandatory in openid_connect:8.x-2.0. See https://www.drupal.org/project/openid_connect/issues/3201504', E_USER_DEPRECATED);
    }
    $this->connection = $connection;
    $this->userStorage = $entity_type_manager ? $entity_type_manager->getStorage('user') : \Drupal::entityTypeManager()->getStorage('user');
  }

  /**
   * Create a local to remote account association.
   *
   * @param object $account
   *   A user account object.
   * @param string $client_name
   *   The client name.
   * @param string $sub
   *   The remote subject identifier.
   */
  public function createAssociation($account, $client_name, $sub) {
    $existing_accounts = $this->getConnectedAccounts($account, $client_name);
    // Only create record if association to account doesn't exist yet.
    if (!isset($existing_accounts[$client_name]) || $existing_accounts[$client_name] !== $sub) {
      $this->connection->insert('openid_connect_authmap')
        ->fields([
          'uid' => $account->id(),
          'client_name' => $client_name,
          'sub' => $sub,
        ])
        ->execute();
    }
  }

  /**
   * Deletes a user's authmap entries.
   *
   * @param int $uid
   *   A user id.
   * @param string $client_name
   *   A client name.
   */
  public function deleteAssociation($uid, $client_name = '') {
    $query = $this->connection->delete('openid_connect_authmap')
      ->condition('uid', $uid);
    if (!empty($client_name)) {
      $query->condition('client_name', $client_name, '=');
    }
    $query->execute();
  }

  /**
   * Loads a user based on a sub-id and a login provider.
   *
   * @param string $sub
   *   The remote subject identifier.
   * @param string $client_name
   *   The client name.
   *
   * @return object|bool
   *   A user account object or FALSE
   */
  public function userLoadBySub($sub, $client_name) {
    $result = $this->connection->select('openid_connect_authmap', 'a')
      ->fields('a', ['uid'])
      ->condition('client_name', $client_name, '=')
      ->condition('sub', $sub, '=')
      ->execute();
    foreach ($result as $record) {
      /** @var \Drupal\user\Entity\User $account */
      $account = $this->userStorage->load($record->uid);
      if (is_object($account)) {
        return $account;
      }
    }
    return FALSE;
  }

  /**
   * Get a list of external OIDC accounts connected to this Drupal account.
   *
   * @param object $account
   *   A Drupal user entity.
   * @param string $client_name
   *   An optional client name.
   *
   * @return array
   *   An array of 'sub' properties keyed by the client name.
   */
  public function getConnectedAccounts($account, $client_name = '') {
    $query = $this->connection->select('openid_connect_authmap', 'a')
      ->fields('a', ['client_name', 'sub'])
      ->condition('uid', $account->id());
    if (!empty($client_name)) {
      $query->condition('client_name', $client_name, '=');
    }

    $result = $query->execute();
    $authmaps = [];
    foreach ($result as $record) {
      $client = $record->client_name;
      $sub = $record->sub;
      $authmaps[$client] = $sub;
    }
    return $authmaps;
  }

}
