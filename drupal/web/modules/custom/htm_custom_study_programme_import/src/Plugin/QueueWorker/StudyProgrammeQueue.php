<?php

namespace Drupal\htm_custom_study_programme_import\Plugin\QueueWorker;
use Drupal\Core\Queue\QueueWorkerBase;
use Drupal\htm_custom_study_programme_import\Controller\StudyProgrammeController;
/**
 * Processes Tasks for Learning.
 *
 * @QueueWorker(
 *   id = "cron_htm_custom_study_programme_import",
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
    $import_controller->save_programme($programme);
  }
}
