<?php
/**
 * @file
 * Contains \Drupal\htm_custom_import_job_offers\Plugin\QueueWorker\CachePurgeQueue.
 */
namespace Drupal\htm_custom_import_job_offers\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\htm_custom_import_job_offers\Controller\JobOffersImportController;

/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_htm_custom_import_job_offers_delete",
 *   title = @Translation("Import task worker: job offers delete queue"),
 *   cron = {"time" = 30}
 * )
 */

class JobOffersDeleteQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($old_nodeid) {
    $import_controller = new JobOffersImportController();
    $import_controller->delete_old_offers($old_nodeid);
  }
}
