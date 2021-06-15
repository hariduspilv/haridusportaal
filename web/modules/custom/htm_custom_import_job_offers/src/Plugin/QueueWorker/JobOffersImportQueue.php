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
 *   id = "cron_htm_custom_import_job_offers",
 *   title = @Translation("Import task worker: job offers queue"),
 *   cron = {"time" = 30}
 * )
 */
class JobOffersImportQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($single_offer) {
    $import_controller = new JobOffersImportController();
    $import_controller->save_offers($single_offer);
  }
}
