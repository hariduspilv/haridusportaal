<?php

namespace Drupal\custom_study_programme_import\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class StudyProgrammeController.
 */
class StudyProgrammeController extends ControllerBase {

  /**
   * Import.
   *
   * @return string
   *   Return Hello string.
   */
  public function import() {
    return [
      '#type' => 'markup',
      '#markup' => $this->t('Implement method: import')
    ];
  }

}
