<?php
/**
 * @file
 * Contains \Drupal\import_school_data\Plugin\QueueWorker\CachePurgeQueue.
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
  public function processItem($school) {
    $import_controller = new JobOffersImportController();
    $loctaxonomy = $import_controller->get_taxonomy_terms('educational_institution_location');
    $action = $import_controller->save_school($school, $loctaxonomy);
    if($action === 'update'){
      $message = t('Uuendatud kooli @school', array('@school' => $school['school_field']['title']));
      \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }
    if($action === 'create'){
      $message = t('Loodud kool @school', array('@school' => $school['school_field']['title']));
      \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }
    if($action === 'unpublish'){
      $message = t('Avaldamine lõpetatud koolil @school', array('@school' => $school['school_field']['title']));
      \Drupal::service('htm_custom_file_logging.write')->write('notice', 'EHIS avaandmetest õppeasutuste uuendamine', $message);
    }
  }
}
