<?php

namespace Drupal\htm_custom_file_logging;

use Monolog\Logger;
use Monolog\Handler\StreamHandler;

/**
 * Class WriteService.
 */
class WriteService {

  public function write($severity, $type, $message) {
    $type = $this->parse_filename($type);
    $type != NULL || $type != '' ? $logpath = $this->createLogFile($type) : false;
    $this->createLogEntry($severity, $logpath, $type, $message);
  }

  private function createLogFile($type){
    $logpath = '/app/drupal/web/sites/default/files/logs/'.date('Y').'/'.date('m');
    if(!file_exists($logpath)) mkdir($logpath, 0744, true);
    $logpath .= '/'.$type.'.log';
    fopen($logpath, 'a');

    return $logpath;
  }

  private function createLogEntry($severity, $logpath, $type, $message){
    $log = new Logger($type);
    $log->pushHandler(new StreamHandler($logpath));

    switch($severity){
      case 'debug':
        $log->debug($message);
        break;
      case 'info':
        $log->info($message);
        break;
      case 'notice':
        $log->notice($message);
        break;
      case 'warning':
        $log->debug($message);
        break;
      case 'error':
        $log->error($message);
        break;
      case 'critical':
        $log->critical($message);
        break;
      case 'alert':
        $log->alert($message);
        break;
      case 'emergency':
        $log->emergency($message);
        break;
    }
  }

  private function parse_filename($filename){
    return mb_strtolower(str_replace(' ', '_', $filename));
  }

}
