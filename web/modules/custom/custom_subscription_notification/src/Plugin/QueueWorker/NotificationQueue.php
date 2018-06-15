<?php

namespace Drupal\custom_subscription_notification\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\custom_study_programme_import\Controller\NotificationController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_custom_subscription_notification,
 *   title = @Translation("Import task worker: notification queue"),
 *   cron = {"time" = 30}
 * )
 */
class NotificationQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($notification) {
    $import_controller = new NotificationController();
    $import_controller->send_notification($notification);
  }
}
