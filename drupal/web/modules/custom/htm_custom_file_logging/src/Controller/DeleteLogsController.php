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
    return $directories;
  }

  private function getOldYearDirectories(&$directories) {
    $year = date('Y');
    $scanned = array_diff(scandir($this->logpath), ['.', '..', '.htaccess', $year]);
    $directories = array_map(function($directory) {
      return $this->logpath . $directory;
    }, $scanned);
  }

  private function getOldMonthDirectories(&$directories) {
    $year = date('Y');
    $month = (int) date('m');
    $scanned = array_diff(scandir($this->logpath . $year), ['.', '..', '.htaccess']);
    $directories = array_merge($directories,
      array_filter(
        array_map(function($directory) use ($year, $month) {
          $dirValue = (int) ltrim($directory, '0');
          if($dirValue > $month || $month - $dirValue >= 2) {
            return $this->logpath . $year . '/' . $directory;
          }
        }, $scanned),
        function($v) { return !is_null($v); }));
  }
}
