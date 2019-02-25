<?php

namespace Drupal\htm_custom_subscriptions_notification\Controller;

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
    $mailitems = [];
    $content_types = ['news', 'event'];
    $notification_tags = $this->get_notification_tags($content_types);
    $subscription_entities = $this->get_subscription_entities('subscription_entity', $notification_tags);
    if(count($subscription_entities > 0)){
      foreach($subscription_entities as $entity){
        $mailitems[] = $this->notification_email_content($notification_tags, $entity, $content_types);
      }
    }
    return $mailitems;
  }

  public function get_notification_tags($content_types){
    $tags = [];
    $query = \Drupal::entityQuery('node');

    $group = $query
    ->orConditionGroup()
    ->condition('created', time()-86400, '>=')
    ->condition('changed', time()-86400, '>=');

    $nid_result = $query
    ->condition('type', $content_types, 'IN')
    ->condition($group)
    ->execute();

    $nodes = \Drupal::entityManager()->getStorage('node')->loadMultiple($nid_result);
    foreach($nodes as $node){
      $nodetags = $node->toArray()['field_tag'];
      foreach($nodetags as $tag){
        if($tag['target_id'] != ''){
          $tags[] = $tag['target_id'];
        }
      }
    }

    return array_unique($tags);
  }

  public function get_subscription_entities($entity_type, $tags){
    $entities = [];
    if(count($tags) > 0){
      $query = \Drupal::entityQuery($entity_type);
      $result_ids = $query
      ->condition('status', 1)
      ->condition('tag', $tags, 'IN')
      ->execute();

      $entities = \Drupal::entityTypeManager()->getStorage($entity_type)->loadMultiple($result_ids);
    }
    return $entities;
  }

  public function get_content_by_tag($tag, $content_types){
    $query = \Drupal::entityQuery('node');

    $group = $query
    ->orConditionGroup()
    ->condition('created', time()-86400, '>=')
    ->condition('changed', time()-86400, '>=');

    $nid_result = $query
    ->condition('type', $content_types, 'IN')
    ->condition('field_tag', $tag['target_id'])
    ->condition($group)
    ->execute();

    $querynodes = \Drupal::entityManager()->getStorage('node')->loadMultiple($nid_result);
    foreach($querynodes as $node){
      $nodes[$node->toArray()['type'][0]['target_id']][] = $node;
    }

    return $nodes ? $nodes : FALSE;
  }

  public function notification_email_content($tags, $entity, $content_types){
    $token_service = \Drupal::token();
    $langcode = $entity->language->value;
    $config = _get_config($langcode, 'htm_custom_admin_form.customadmin');
    $link_root = $config->get('general.fe_url');
    $tags = $entity->toArray()['tag'];
    foreach($tags as $tag){
      $contents = $this->get_content_by_tag($tag, $content_types);
    }
    if($contents){
        $news = $contents['news'];
        $events = $contents['event'];

        $template['subject'] = $config->get('emails.email_subscription.notify_email_subject');
        $template['body'] = $config->get('emails.email_subscription.notify_email_body');

        $email['subject'] = $token_service->replace($template['subject'], ['subscription_entity' => $entity, 'news' => $news, 'events' => $events], ['clear' => TRUE, 'langcode' => $langcode, 'custom_link_path' => $link_root]);
        $email['body'] = $token_service->replace($template['body'], ['subscription_entity' => $entity, 'news' => $news, 'events' => $events], ['clear' => TRUE, 'langcode' => $langcode, 'custom_link_path' => $link_root]);
        $email['entity'] = $entity;

        return $email;
    }
  }
}
