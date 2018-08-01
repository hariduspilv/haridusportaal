<?php

namespace Drupal\queue_ui\Plugin\QueueUI;

use Drupal\Core\Database\Connection;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\queue_ui\QueueUIBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Defines the default Drupal Queue UI backend
 *
 * @QueueUI(
 *   id = "database_queue",
 *   class_name = "DatabaseQueue"
 * )
 */
class DatabaseQueue extends QueueUIBase implements ContainerFactoryPluginInterface {

  /**
   * @var \Drupal\Core\Database\Database
   */
  private $database;

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @param array $configuration
   * @param string $plugin_id
   * @param mixed $plugin_definition
   *
   * @return \Drupal\Core\Plugin\ContainerFactoryPluginInterface|\Drupal\queue_ui\Plugin\QueueUI\DatabaseQueue
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('database')
    );
  }

  /**
   * DatabaseQueue constructor.
   *
   * @param array $configuration
   * @param $plugin_id
   * @param $plugin_definition
   * @param \Drupal\Core\Database\Connection $database
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, Connection $database) {
    $this->database = $database;
  }

  /**
   * SystemQueue implements all default QueueUI methods.
   *
   * @return array
   *  An array of available QueueUI methods. Array key is system name of the
   *  operation, array key value is the display name.
   */
  public function getOperations() {
    return [
      'view' => t('View'),
      'release' => t('Release'),
      'delete' => t('Delete'),
    ];
  }

  /**
   * @param $queue_name
   *
   * @return mixed
   */
  public function getItems($queue_name) {
    $query = $this->database->select('queue', 'q');
    $query->addField('q', 'item_id');
    $query->addField('q', 'expire');
    $query->addField('q', 'created');
    $query->condition('q.name', $queue_name);
    $query = $query->extend('Drupal\Core\Database\Query\PagerSelectExtender');
    $query = $query->limit(25);

    return $query->execute();
  }

  /**
   * @param $queue_name
   *
   * @return \Drupal\Core\Database\StatementInterface|int|null
   */
  public function releaseItems($queue_name) {
    return $this->database->update('queue')
      ->fields([
        'expire' => 0,
      ])
      ->condition('name', $queue_name, '=')
      ->execute();
  }

  /**
   * Load a specified SystemQueue queue item from the database.
   *
   * @param int $item_id
   * The item id to load
   *
   * @return mixed
   * Result of the database query loading the queue item.
   */
  public function loadItem($item_id) {
    // Load the specified queue item from the queue table.
    $query = $this->database->select('queue', 'q')
      ->fields('q', ['item_id', 'name', 'data', 'expire', 'created'])
      ->condition('q.item_id', $item_id)
      ->range(0, 1); // item id should be unique

    return $query->execute()->fetchObject();
  }

  /**
   * @param int $item_id
   */
  public function releaseItem($item_id) {
    $this->database->update('queue')
      ->condition('item_id', $item_id)
      ->fields(['expire' => 0])
      ->execute();
  }

  /**
   * @param int $item_id
   */
  public function deleteItem($item_id) {
    $this->database->delete('queue')
      ->condition('item_id', $item_id)
      ->execute();
  }

}
