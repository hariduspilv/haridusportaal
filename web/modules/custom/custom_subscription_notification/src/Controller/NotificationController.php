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
    $content_nodes = [];
    $content_nodes = $this->get_notification_tags($content_nodes, 'news');
    $content_nodes = $this->get_notification_tags($content_nodes, 'event');
    $subscription_nodes = $this->get_subscriptions('subscription_entity');
    foreach($subscription_nodes as $subscription){
      $notifications[] = $this->get_notifications($content_nodes, $subscription);
    }
    kint($notifications);
    die();
  }

  public function get_notifications($nodes, $subscription){
    foreach($nodes as $tag => $node){
      if(in_array($tag, $subscription['tag'])){
        $subscription['notification_nodes'] = $node;
      }
    }
    return $subscription;
  }

  public function get_notification_tags($content_nodes, $content_type){
    $nodes = [];
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
      $node = \Drupal::entityManager()->getStorage('node')->load($nid);
      $tags = $this->get_node_tags($node->toArray()['field_tag']);
      $content_nodes = $this->node_to_tag($content_nodes, $nid, $tags);
    }
    return $content_nodes;
  }

  public function node_to_tag($tagsnodes, $nid, $tags){
    foreach($tags as $tag){
      $tagsnodes[$tag][] = $nid;
    }
    return $tagsnodes;
  }

  public function get_node_tags($tags){
    foreach($tags as $tag){
      $nodetags[] = $tag['target_id'];
    }
    return $nodetags;
  }

  public function get_subscriptions($entity_type){
    $entities = [];
    $query = \Drupal::entityQuery($entity_type);
    $query->condition('status', 1);
    $result_ids = $query->execute();

    foreach($result_ids as $nid){
      $entity_ids[] = $nid;
      $node = \Drupal::entityTypeManager()->getStorage($entity_type)->load($nid)->toArray();
      foreach($node['tag'] as $tag){
        $entities[$nid]['tag'][] = $tag['target_id'];
      }
      $entities[$nid]['subscriber_email'] = $node['subscriber_email'];
      $entities[$nid]['langcode'] = $node['langcode'];
    }

    return $entities;
  }

  private function parse_key($key){
    return mb_strtolower(str_replace(' ', '_', $key));
  }

}
