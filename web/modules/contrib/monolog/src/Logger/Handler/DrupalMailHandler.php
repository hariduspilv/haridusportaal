<?php

namespace Drupal\monolog\Logger\Handler;

use Monolog\Handler\MailHandler;
use Monolog\Logger;

/**
 * Class DrupalMailHandler.
 */
class DrupalMailHandler extends MailHandler {

  private $to;

  /**
   * DrupalMailHandler constructor.
   *
   * @param $to
   * @param int $level
   * @param bool $bubble
   */
  public function __construct($to, $level = Logger::ERROR, $bubble = TRUE) {
    parent::__construct($level, $bubble);

    $this->to = $to;
  }

  /**
   * {@inheritdoc}
   */
  protected function send($content, array $records) {
    /** @var \Drupal\Core\Mail\MailManagerInterface $mail */
    $mail = \Drupal::service('plugin.manager.mail');
    /** @var \Drupal\Core\Language\LanguageInterface $default_language */
    $default_language = \Drupal::languageManager()->getDefaultLanguage();

    $params = [
      'content' => $content,
      'records' => $records,
    ];
    $mail->mail('monolog', 'default', $this->to, $default_language->getName(), $params);
  }

}
