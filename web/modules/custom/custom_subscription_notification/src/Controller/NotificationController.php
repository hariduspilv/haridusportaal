<?php

namespace Drupal\custom_subscription_notification\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class NotificationController.
 */
class NotificationController extends ControllerBase {

  /**
   * Notify.
   *
   * @return string
   *   Return Hello string.
   */
  public function notify() {
    $news_nodes = $this->get_latest_nodes('news');
    $event_nodes = $this->get_latest_nodes('event');
    $subscription_nodes = $this->get_subscriptions('subscription_entity');
    kint($subscription_nodes);
    die();
  }

  public function get_latest_nodes($content_type){
    $node = [];
    $query = \Drupal::entityQuery('node');

    $group = $query
    ->orConditionGroup()
    ->condition('created', time()-86400, '>=')
    ->condition('changed', time()-86400, '>=');

    $nid_result = $query
    ->condition('type', $content_type)
    ->condition($group)
    ->execute();

    foreach($nid_result as $nid){
      $node['nid'][] = $nid;
    }

    return $node;
  }

  public function get_subscriptions($entity_type){
    $fields = [];
    $query = \Drupal::entityQuery($entity_type);
    $query->condition('status', 1);
    $entity_ids = $query->execute();

    foreach($entity_ids as $nid){
      $node = \Drupal::entityTypeManager()->getStorage($entity_type)->load($nid);
      $fields[$nid] = $node->toArray()['tag'];
    }
    foreach($fields['144'] as $jou){
      kint($jou);
    }
    die();

    return $entity_ids;
  }

}
