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
      // Create a directory to files/logs folder with apache:apache user-group
      // For year directory
      $logpath_year = '/app/drupal/web/sites/default/files/logs/'.date('Y');
      if(!file_exists($logpath_year)) {
        mkdir($logpath_year, 0744, true);
        chown($logpath_year, 'apache');
        chgrp($logpath_year, 'apache');
      }
      // For month directory
      $logpath = $logpath_year.'/'.date('m');
      if(!file_exists($logpath)) {
        mkdir($logpath, 0744, true);
        chown($logpath, 'apache');
        chgrp($logpath, 'apache');
      }
      $logpath .= '/'.$type.'.log';
      fopen($logpath, 'a');
      // If directory already exists and its user:group is not apache, then change it to apache
      if(file_exists($logpath)) {
        $user = fileowner($logpath);
        $userinfo = posix_getpwuid($user);
        if (!empty($userinfo)){
          if ($userinfo['name']!='apache'){
            chown($logpath,'apache');
            chgrp($logpath,'apache');
          }
        }
      }
      return $logpath;
    }

    private function createLogEntry($severity, $logpath, $type, $message){
        $log = new Logger($type);
        $log->pushHandler(new StreamHandler($logpath));

        switch($severity){
            case 'debug':
            case '7':
                $log->debug($message);
                break;
            case 'info':
            case '6':
                $log->info($message);
                break;
            case 'notice':
            case '5':
                $log->notice($message);
                break;
            case 'warning':
            case '4':
                $log->debug($message);
                break;
            case 'error':
            case '3':
                $log->error($message);
                break;
            case 'critical':
            case '2':
                $log->critical($message);
                break;
            case 'alert':
            case '1':
                $log->alert($message);
                break;
            case 'emergency':
            case '0':
                $log->emergency($message);
                break;
        }
    }

    private function parse_filename($filename){
        return mb_strtolower(str_replace(' ', '_', $filename));
    }

}
