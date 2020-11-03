<?php

namespace Drupal\custom_logging_to_file\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class DeleteLogsController.
 */
class DeleteLogsController extends ControllerBase {

  public $logpath = '/app/drupal/web/sites/default/files/logs/';

  public function import() {
    $directories = [];
    $month = date('m');
    $this->getOldYearDirectories($directories);
    dump($directories);
    die();
  }

  private function getOldYearDirectiories(&$directories) {
    $year = date('Y');
    $files = scandir($this->logpath);
    dump($files);
  }
}
