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
    $notifications = [];
    $mailitems = [];
    $content_nodes = $this->get_notification_tags($content_nodes, 'news');
    $content_nodes = $this->get_notification_tags($content_nodes, 'event');
    $subscription_nodes = $this->get_subscriptions('subscription_entity');
    foreach($subscription_nodes as $subscription){
      $notifications[] = $this->get_notifications($content_nodes, $subscription);
    }
    foreach($notifications as $notification){
      $mailitems[] = $this->create_mail_item($notification);
    }
    return $mailitems;
  }

  public function create_mail_item($notification){
    $params['body'] = $this->notification_email_content($notification);
    $params['title'] = t('Haridusteemalised uudised');

    return $params;
  }

  public function get_notifications($nodes, $subscription){

    foreach($nodes as $key => $tags){
      $notification_node = $this->add_node_to_notification($key, $tags, $subscription);
      if($notification_node != NULL){
        $subscription['notification_nodes'][$key] = $notification_node;
      }
    }
    if(isset($subscription['notification_nodes'])){
      return $subscription;
    }
  }

  public function add_node_to_notification($content_type, $tags, $subscription){
$notifynodes = [];
    foreach($tags as $tag => $node){
      if(in_array($tag, $subscription['tag'])){
        $notifynodes[$content_type] = $node;
      }
    }
    if(isset($notifynodes[$content_type])){
      return $notifynodes[$content_type];
    }
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
      $content_nodes = $this->node_to_tag($content_nodes, $nid, $tags, $content_type);
    }
    return $content_nodes;
  }

  public function node_to_tag($tagsnodes, $nid, $tags, $type){
    foreach($tags as $tag){
      $tagsnodes[$type][$tag][] = $nid;
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
      if(count($node['tag']) > 0){
        foreach($node['tag'] as $tag){
          $entities[$nid]['tag'][] = $tag['target_id'];
        }
        $entities[$nid]['subscriber_email'] = $node['subscriber_email'];
        $entities[$nid]['langcode'] = $node['langcode'];
      }
    }

    return $entities;
  }

  public function notification_email_content($message){
    $body = [];

    if(isset($message['notification_nodes']['news'])){
      foreach($message['notification_nodes']['news'] as $nid){
        $nodeitem = \Drupal\node\Entity\Node::load($nid);
        $title = $nodeitem->getTitle();
        $url = $nodeitem->toUrl()->toString();
        $body['news'][$url] = $title;
      }
    }
    if(isset($message['notification_nodes']['event'])){
      foreach($message['notification_nodes']['event'] as $nid){
        $nodeitem = \Drupal\node\Entity\Node::load($nid);
        $title = $nodeitem->getTitle();
        $url = $nodeitem->toUrl()->toString();
        $body['event'][$url] = $title;
      }
    }
    $body['email'] = $message['subscriber_email'][0]['value'];
    $body['langcode'] = $message['langcode'][0]['value'];

    return[
      '#theme' => 'newsletter_notification_email_template',
      '#body' => $body,
    ];
  }

  private function parse_key($key){
    return mb_strtolower(str_replace(' ', '_', $key));
  }

}
