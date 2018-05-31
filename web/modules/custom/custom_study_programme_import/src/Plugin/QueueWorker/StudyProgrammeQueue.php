<?php

namespace Drupal\custom_study_programme_import\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\custom_study_programme_import\Controller\StudyProgrammeController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_custom_study_programme_import",
 *   title = @Translation("Import task worker: programme import queue"),
 *   cron = {"time" = 30}
 * )
 */
class StudyProgrammeQueue extends QueueWorkerBase {
  /**
   * {@inheritdoc}
   */
  public function processItem($programme) {
    $import_controller = new StudyProgrammeController();
    $iscedftaxonomy = $import_controller->get_taxonomy_terms('isced_f');
    $import_controller->save_programme($programme, $iscedftaxonomy);
  }
}
