<?php

namespace Drupal\queue_ui;

use Drupal\Core\Url;

/**
 * Class QueueUIDatabaseQueue
 * @package Drupal\queue_ui
 */
class QueueUIDatabaseQueue implements QueueUIInterface {

  /**
   * @var bool
   */
  public $inspect;

  /**
   * {@inheritdoc}
   */
  public function __construct() {
    $this->inspect = TRUE;
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
   * View the queue items in a queue and expose additional methods for inspection.
   *
   * @param string $queue_name
   * @return array
   */
  public function inspect($queue_name) {
    $query = db_select('queue', 'q');
    $query->addField('q', 'item_id');
    $query->addField('q', 'expire');
    $query->addField('q', 'created');
    $query->condition('q.name', $queue_name);
    $query = $query->extend('Drupal\Core\Database\Query\PagerSelectExtender');
    $query = $query->limit(25);
    $result = $query->execute();

    $header = [
      'id' => t('Item ID'),
      'expires' => t('Expires'),
      'created' => t('Created'),
      'operations' => t('Operations'),
    ];

    $rows = [];
    foreach ($result as $item) {
      $operations = [];
      foreach ($this->getOperations() as $op => $title) {
        $operations[] = [
          'title' => $title,
          'url' => Url::fromUserInput("/" . QUEUE_UI_BASE . "/$queue_name/$op/$item->item_id"),
        ];
      }

      $row = [
        'id' => $item->item_id,
        'expires' => ($item->expire ? date(DATE_RSS, $item->expire) : $item->expire),
        'created' => date(DATE_RSS, $item->created),
        'operations' => [
          'data' => [
            '#type' => 'dropbutton',
            '#links' => $operations,
          ],
        ]
      ];

      $rows[] = $row;
    }

    return [
      'table' => [
        '#type' => 'table',
        '#header' => $header,
        '#rows' => $rows
      ],
      'pager' => [
        '#type' => 'pager'
      ],
    ];
  }

  /**
   * View the item data for a specified queue item.
   *
   * @param int $item_id
   * @return array
   */
  public function view($item_id) {
    $queue_item = $this->loadItem($item_id);

    $data = '<pre>' . print_r(unserialize($queue_item->data), TRUE) . '</pre>';
    // Use kpr to print the data
    if (\Drupal::service('module_handler')->moduleExists('devel')) {
      $data = kpr(unserialize($queue_item->data), TRUE);
    }

    $rows = [
      'id' => [
        'data' => [
          'header' => t('Item ID'),
          'data' => $queue_item->item_id,
        ],
      ],
      'queue_name' => [
        'data' => [
          'header' => t('Queue name'),
          'data' => $queue_item->name,
        ],
      ],
      'expire' => [
        'data' => [
          'header' => t('Expire'),
          'data' => ($queue_item->expire ? date(DATE_RSS, $queue_item->expire) : $queue_item->expire),
        ]
      ],
      'created' => [
        'data' => [
          'header' => t('Created'),
          'data' => date(DATE_RSS, $queue_item->created),
        ],
      ],
      'data' => [
        'data' => [
          'header' => ['data' => t('Data'), 'style' => 'vertical-align:top'],
          'data' => $data,
        ],
      ],
    ];

    return [
      'table' => [
        '#type' => 'table',
        '#rows' => $rows
      ],
    ];
  }

  /**
   * @param int $item_id
   * @return bool
   */
  public function delete($item_id) {
    // @TODO - try... catch...
    drupal_set_message("Deleted queue item " . $item_id);

    \Drupal::database()->delete('queue')
      ->condition('item_id', $item_id)
      ->execute();

    return TRUE;
  }

  /**
   * @param int $item_id
   * @return bool
   */
  public function release($item_id) {
    // @TODO - try... catch...
    drupal_set_message("Released queue item " . $item_id);

    \Drupal::database()->update('queue')
      ->condition('item_id', $item_id)
      ->fields(['expire' => 0])
      ->execute();

    return TRUE;
  }

  /**
   * Load a specified SystemQueue queue item from the database.
   *
   * @param $item_id
   *  The item id to load
   * @return
   *  Result of the database query loading the queue item.
   */
  private function loadItem($item_id) {
    // Load the specified queue item from the queue table.
    $query = \Drupal::database()->select('queue', 'q')
      ->fields('q', ['item_id', 'name', 'data', 'expire', 'created'])
      ->condition('q.item_id', $item_id)
      ->range(0, 1); // item id should be unique

    return $query->execute()->fetchObject();
  }
}
