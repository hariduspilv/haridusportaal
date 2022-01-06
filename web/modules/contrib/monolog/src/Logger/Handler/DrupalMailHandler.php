<?php

namespace Drupal\monolog\Logger\Handler;

use Drupal\Core\Mail\MailManagerInterface;
use Monolog\Handler\MailHandler;
use Monolog\Logger;

/**
 * DrupalMailHandler uses the Drupal's core mail manager to send Log emails.
 */
class DrupalMailHandler extends MailHandler {

  /**
   * The mail address to send the log emails to.
   *
   * @var string
   */
  private string $to;

  /**
   * DrupalMailHandler constructor.
   *
   * @param string $to
   *   The mail address to send the log emails to.
   * @param int $level
   *   The minimum logging level at which this handler will be triggered.
   * @param bool $bubble
   *   The bubbling behavior.
   */
  public function __construct(
    $to,
    $level = Logger::ERROR,
    bool $bubble = TRUE
  ) {
    parent::__construct($level, $bubble);

    $this->to = $to;
  }

  /**
   * {@inheritdoc}
   */
  protected function send(string $content, array $records): void {
    $mail = \Drupal::service('plugin.manager.mail');
    assert($mail instanceof MailManagerInterface);

    $default_language = \Drupal::languageManager()->getDefaultLanguage();

    $params = [
      'content' => $content,
      'records' => $records,
    ];
    $mail->mail('monolog', 'default', $this->to, $default_language->getName(),
      $params);
  }

}
