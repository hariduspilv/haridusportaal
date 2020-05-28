<?php

namespace Drupal\filelog\Logger;

use Drupal\Component\Datetime\TimeInterface;
use Drupal\Component\Render\PlainTextOutput;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Logger\LogMessageParserInterface;
use Drupal\Core\Logger\RfcLoggerTrait;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\State\StateInterface;
use Drupal\Core\Utility\Token;
use Drupal\filelog\FileLogException;
use Drupal\filelog\LogFileManagerInterface;
use Drupal\filelog\LogMessage;
use Psr\Log\LoggerInterface;
use function file_exists;
use function fopen;
use function fwrite;
use function watchdog_exception;

class FileLog implements LoggerInterface {

  use RfcLoggerTrait;
  use DependencySerializationTrait;

  public const FILENAME = 'drupal.log';

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
   * @var \Drupal\Core\Logger\LogMessageParserInterface
   */
  protected $parser;

  /**
   * @var \Drupal\Component\Datetime\TimeInterface
   */
  protected $time;

  /**
   * @var resource
   */
  protected $logFile;

  /**
   * @var resource
   */
  protected $stderr;

  /**
   * @var \Drupal\filelog\LogFileManagerInterface
   */
  protected $fileManager;

  /**
   * FileLog constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface    $configFactory
   * @param \Drupal\Core\State\StateInterface             $state
   * @param \Drupal\Core\Utility\Token                    $token
   * @param \Drupal\Component\Datetime\TimeInterface      $time
   * @param \Drupal\Core\Logger\LogMessageParserInterface $parser
   * @param \Drupal\filelog\LogFileManagerInterface       $fileManager
   */
  public function __construct(ConfigFactoryInterface $configFactory,
                              StateInterface $state,
                              Token $token,
                              TimeInterface $time,
                              LogMessageParserInterface $parser,
                              LogFileManagerInterface $fileManager) {
    $this->config = $configFactory->get('filelog.settings');
    $this->state = $state;
    $this->token = $token;
    $this->time = $time;
    $this->parser = $parser;
    $this->fileManager = $fileManager;
  }

  /**
   * Get the complete filename of the log.
   *
   * @return string
   */
  public function getFileName(): string {
    return $this->config->get('location') . '/' . self::FILENAME;
  }

  /**
   * Open the logfile for writing.
   *
   * @return bool
   *   Returns TRUE if the log file is available for writing.
   *
   * @throws \Drupal\filelog\FileLogException
   */
  protected function openFile(): bool {
    if ($this->logFile) {
      return TRUE;
    }

    // When creating a new log file, save the creation timestamp.
    $filename = $this->getFileName();
    $create = !file_exists($filename);
    if (!$this->fileManager->ensurePath()) {
      $this->logFile = $this->stderr();
      throw new FileLogException('The log directory has disappeared.');
    }
    if ($this->logFile = fopen($filename, 'ab')) {
      if ($create) {
        $this->state->set('filelog.rotation', $this->time->getRequestTime());
      }
      return TRUE;
    }

    // Log errors to STDERR until the end of the current request.
    $this->logFile = $this->stderr();
    throw new FileLogException('The logfile could not be opened for writing. Logging to STDERR.');
  }

  /**
   * {@inheritdoc}
   */
  public function log($level, $message, array $context = []): void {
    if (!$this->shouldLog($level, $message, $context)) {
      return;
    }

    $entry = $this->render($level, $message, $context);

    try {
      $this->openFile();
      $this->write($entry);
    } catch (FileLogException $error) {
      // Log the exception, unless we were already logging a filelog error.
      if ($context['channel'] !== 'filelog') {
        watchdog_exception('filelog', $error);
      }
      // Write the message directly to STDERR.
      fwrite($this->stderr(), $entry . "\n");
    }
  }

  /**
   * Decides whether a message should be logged or ignored.
   *
   * @param mixed  $level
   * @param string $message
   * @param array  $context
   *
   * @return bool
   */
  protected function shouldLog($level, $message, array $context = []): bool {
    // Ignore any messages below the configured severity.
    // (Severity decreases with level.)
    return $this->config->get('enabled') &&
           $level <= $this->config->get('level');
  }

  /**
   * Renders a message to a string.
   *
   * @param mixed  $level
   * @param string $message
   * @param array  $context
   *
   * @return string
   */
  protected function render($level, $message, array $context = []): string {
    // Populate the message placeholders.
    $variables = $this->parser->parseMessagePlaceholders($message, $context);
    // Pass in bubbleable metadata that are just discarded later to prevent a
    // LogicException due to too early rendering. The metadata of the string
    // is not needed as it is not used for cacheable output but for writing to a
    // logfile.
    $bubbleable_metadata_to_discard = new BubbleableMetadata();
    $log = new LogMessage($level, $message, $variables, $context);
    $entry = $this->token->replace(
      $this->config->get('format'),
      ['log' => $log],
      [],
      $bubbleable_metadata_to_discard
    );
    return PlainTextOutput::renderFromHtml($entry);
  }

  /**
   * Open STDERR resource, or use STDERR constant if available.
   *
   * @return resource
   */
  protected function stderr() {
    if ($this->stderr === NULL) {
      $this->stderr = defined('STDERR') ? STDERR : fopen('php://stderr', 'wb');
    }
    return $this->stderr;
  }

  /**
   * Write an entry to the logfile.
   *
   * @param string $entry
   *
   * @throws \Drupal\filelog\FileLogException
   */
  protected function write($entry): void {
    if (!fwrite($this->logFile, $entry . "\n")) {
      throw new FileLogException('The message could not be written to the logfile.');
    }
  }

}
