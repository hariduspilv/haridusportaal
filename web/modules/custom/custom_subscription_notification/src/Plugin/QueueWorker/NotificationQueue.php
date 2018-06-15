<?php

namespace Drupal\custom_subscription_notification\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\custom_subscription_notification\Controller\NotificationController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_custom_subscription_notification",
 *   title = @Translation("Import task worker: subscription notification queue"),
 *   cron = {"time" = 30}
 * )
 */
class NotificationQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($notification) {
    $import_controller = new NotificationController();

    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'custom_subscription_notification';
    $key = 'notification_email';
    $recipient = $notification['body']['#body']['email'];
    $langcode = $notification['body']['#body']['langcode'];
    $params = $notification;
    $send = true;

    $result = $mailManager->mail($module, $key, $recipient, $langcode, $params, NULL, $send);
    if ($result['result'] !== true) {
      $message = t('There was a problem sending email notification to @email', array('@email' => $recipient));
      \Drupal::logger('custom_subscription_notification')->error($message);
    }else{
      $message = t('An email notification has been sent to @email', array('@email' => $recipient));
      \Drupal::logger('custom_subscription_notification')->notice($message);
    }
  }
}
