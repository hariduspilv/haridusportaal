<?php
/**
 * @file
 * Contains \Drupal\import_school_data\Plugin\QueueWorker\CachePurgeQueue.
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
