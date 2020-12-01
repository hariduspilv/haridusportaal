<?php

namespace Drupal\htm_custom_file_logging\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\htm_custom_file_logging\Controller\DeleteLogsController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_htm_custom_file_logging",
 *   title = @Translation("Delete task worker: log delete queue"),
 *   cron = {"time" = 30}
 * )
 */
class LogFileQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($directory) {
    $import_controller = new DeleteLogsController();
    $import_controller->delete_log($directory);
  }
}
