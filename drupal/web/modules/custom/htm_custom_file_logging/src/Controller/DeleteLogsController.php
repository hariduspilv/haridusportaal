<?php

namespace Drupal\htm_custom_file_logging\Controller;

use Drupal\Core\Controller\ControllerBase;

/**
 * Class DeleteLogsController.
 */
class DeleteLogsController extends ControllerBase {

  public $logpath = '/app/drupal/web/sites/default/files/logs/';

  public function old_list() {
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
