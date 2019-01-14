<?php

namespace Drupal\htm_custom_subscriptions_notification\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;

/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_htm_custom_subscriptions_notification",
 *   title = @Translation("Import task worker: subscription notification queue"),
 *   cron = {"time" = 30}
 * )
 */
class NotificationQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($notification) {

    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'htm_custom_subscriptions_notification';
    $key = 'notification_email';
    $recipient = $notification['entity']->subscriber_email->value;
    $langcode = $notification['entity']->language->value;
    $params = $notification;
    $send = true;

    $result = $mailManager->mail($module, $key, $recipient, $langcode, $params, NULL, $send);
    if ($result['result'] !== true) {
      $message = t('There was a problem sending email notification to @email', array('@email' => $recipient));
      \Drupal::logger('htm_custom_subscriptions_notification')->error($message);
    }else{
      $message = t('An email notification has been sent to @email', array('@email' => $recipient));
      \Drupal::logger('htm_custom_subscriptions_notification')->notice($message);
    }
  }
}
