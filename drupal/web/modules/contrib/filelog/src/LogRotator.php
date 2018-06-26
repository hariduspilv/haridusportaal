<?php

namespace Drupal\filelog;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Render\PlainTextOutput;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Utility\Token;
use Drupal\filelog\Logger\FileLog;

class LogRotator {

  /**
   * @var \Drupal\Core\Config\Config
   */
  protected $config;

  /**
   * @var \Drupal\Core\State\StateInterface
   */
  protected $state;

  /**
   * @var \Drupal\Core\Utility\Token
   */
  protected $token;

  /**
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $time;

  /**
   * @var \Drupal\filelog\Logger\FileLog
   */
  protected $fileLog;

  /**
   * LogRotator constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   * @param \Drupal\Core\State\StateInterface          $state
   * @param \Drupal\Core\Utility\Token                 $token
   * @param \Drupal\Component\Datetime\TimeInterface   $time
   * @param \Drupal\filelog\Logger\FileLog             $fileLog
   */
  public function __construct(ConfigFactoryInterface $configFactory,
                              StateInterface $state,
                              Token $token,
                              TimeInterface $time,
                              FileLog $fileLog
  ) {
    $this->config = $configFactory->get('filelog.settings');
    $this->state = $state;
    $this->token = $token;
    $this->time = $time;
    $this->fileLog = $fileLog;
  }

  /**
   * Check and rotate if necessary.
   *
   * @param bool $force
   *   Bypass the scheduler and force rotation.
   *
   * @return bool
   *   Returns TRUE if the rotation was successful.
   *
   *
   * @throws \Drupal\filelog\FileLogException
   */
  public function run($force = FALSE): bool {
    if ($force || $this->shouldRun($this->time->getRequestTime())) {
      return $this->rotateFile();
    }
    return FALSE;
  }

  /**
   * Check if sufficient time has passed since the last log rotation.
   *
   * @param int $now
   *
   * @return bool
   */
  public function shouldRun($now): bool {
    $last = $this->state->get('filelog.rotation');
    switch ($this->config->get('rotation.schedule')) {
      case 'monthly':
        return \date('m', $last) !== \date('m', $now);

      case 'weekly':
        return \date('W', $last) !== \date('W', $now);

      case 'daily':
        return \date('d', $last) !== \date('d', $now);
    }

    return FALSE;
  }

  /**
   * Rotate the log file.
   *
   * @throws \Drupal\filelog\FileLogException
   */
  protected function rotateFile(): bool {
    $logFile = $this->fileLog->getFileName();
    $truncate = $this->config->get('rotation.delete');
    $timestamp = $this->state->get('filelog.rotation');

    if (!$truncate) {
      $destination = $this->token->replace(
        $this->config->get('rotation.destination'),
        ['date' => $timestamp]
      );
      $destination = PlainTextOutput::renderFromHtml($destination);
      $destination = $this->config->get('location') . '/' . $destination;
      $directory = \dirname($destination);
      \file_prepare_directory($directory, FILE_CREATE_DIRECTORY);
      if ($this->config->get('rotation.gzip')) {
        $truncate = TRUE;
        $data = \file_get_contents($logFile);
        if (!\file_put_contents($destination . '.gz', \gzencode($data))) {
          throw new FileLogException("Log file could not be compressed from $logFile to $destination.gz.");
        }
      }
      else if (!\rename($logFile, $destination)) {
        throw new FileLogException("Log file could not be moved from $logFile to $destination.");
      }
    }

    if ($truncate) {
      // Simply truncate the log file, to save some file-system operations.
      $file = \fopen($logFile, 'wb');
      if (!$file || !\fclose($file)) {
        throw new FileLogException("Log file $logFile could not be truncated.");
      }
    }

    $this->state->set('filelog.rotation', $this->time->getRequestTime());
    return TRUE;
  }

}
