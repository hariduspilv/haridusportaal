<?php
/**
 * @file
 * Contains \Drupal\mymodule\Plugin\QueueWorker\EmailQueue.
 */
namespace Drupal\import_school_data\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\import_school_data\Controller\SchoolImportController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_import_school_data",
 *   title = @Translation("Import task worker: school import queue"),
 *   cron = {"time" = 30}
 * )
 */
class SchoolImportQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($school) {
    $import_controller = new SchoolImportController();
    $loctaxonomy = $import_controller->get_taxonomy_terms('educational_institution_location');
    $import_controller->save_school($school, $loctaxonomy);
  }
}
