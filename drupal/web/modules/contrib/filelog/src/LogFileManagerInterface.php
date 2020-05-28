<?php

namespace Drupal\filelog;

/**
 * Interface for the LogFileManager service.
 */
interface LogFileManagerInterface {

  /**
   * Ensure that the log directory exists.
   *
   * @return bool
   *   TRUE if the path of the logfile exists and is writeable.
   */
  public function ensurePath(): bool;

}
