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
    $this->getOldYearDirectories($directories);
    $this->getOldMonthDirectories($directories);
    dump($directories);
    die();
  }

  private function getOldYearDirectories(&$directories) {
    $year = date('Y');
    $directories = array_diff(scandir($this->logpath), ['.', '..', '.htaccess', $year]);
    $directories = array_map(function($directory) {
      return $this->logpath . $directory;
    }, $directories);
  }

  private function getOldMonthDirectories(&$directories) {
    $year = date('Y');
    $month = date('m');
    dump($month);
    $directories = array_diff(scandir($this->logpath . $year), ['.', '..', '.htaccess']);
    $directories = array_map(function($directory, $month) {
      $monthValue = (int) $directory;
      $dirValue = (int) $directory;
      if($dirValue > $monthValue || $monthValue - $dirValue >= 2) {
        return $this->logpath . '/' . $directory;
      }
    }, $directories, $month);
  }
}
