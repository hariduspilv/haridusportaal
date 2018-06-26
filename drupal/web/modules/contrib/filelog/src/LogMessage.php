<?php

namespace Drupal\filelog;

use Drupal\Core\Logger\RfcLogLevel;
use Drupal\user\Entity\User;

class LogMessage {

  /**
   * @var array
   */
  protected static $levels;

  /**
   * @var string
   */
  protected $message;

  /**
   * @var string
   */
  protected $text;

  /**
   * @var array
   */
  protected $variables;

  /**
   * @var array
   */
  protected $placeholders;

  /**
   * @var array
   */
  protected $context;

  /**
   * @var int
   */
  protected $level;

  /**
   * @var \Drupal\user\UserInterface
   */
  protected $user;

  /**
   * LogMessage constructor.
   *
   * @param int    $level
   * @param string $message
   * @param array  $variables
   * @param array  $context
   */
  public function __construct($level,
                              $message,
                              array $variables,
                              array $context) {
    $this->level = $level;
    // Store the original placeholders for rendering the message.
    $this->placeholders = $variables;
    $this->message = $message;

    // Strip the variable format prefixes.
    foreach ($variables as $key => $value) {
      if (\in_array($key[0], ['%', '!', '@', ':'], TRUE)) {
        $variables[substr($key, 1)] = $value;
        unset($variables[$key]);
      }
    }

    $this->variables = $variables;
    $this->context = $context + [
        'uid'         => NULL,
        'channel'     => NULL,
        'ip'          => NULL,
        'request_uri' => NULL,
        'referer'     => NULL,
        'timestamp'   => NULL,
      ];
  }

  /**
   * Get untranslated level strings.
   *
   * @return string[]
   */
  public static function getLevels(): array {
    if (!static::$levels) {
      static::$levels = RfcLogLevel::getLevels();
      foreach (static::$levels as $id => $label) {
        /** @var \Drupal\Core\StringTranslation\TranslatableMarkup $label */
        static::$levels[$id] = $label->getUntranslatedString();
      }
    }

    return static::$levels;
  }

  /**
   * @return string
   */
  public function getType(): string {
    return $this->context['channel'];
  }

  /**
   * @return string
   */
  public function getLevel(): string {
    return static::getLevels()[$this->level];
  }

  /**
   * @return string
   */
  public function getText(): string {
    if (!$this->text) {
      $this->text = $this->message;
      if (!empty($this->placeholders)) {
        $this->text = \strtr($this->text, $this->placeholders);
      }
      $this->text = \str_replace("\n", '\n', \strip_tags($this->text));
    }
    return $this->text;
  }

  /**
   * @return string
   */
  public function getLocation(): string {
    return $this->context['request_uri'];
  }

  /**
   * @return string
   */
  public function getIP(): string {
    return $this->context['ip'] ?: '0.0.0.0';
  }

  /**
   * @return string|null
   */
  public function getReferrer(): ?string {
    return $this->context['referer'] ?? NULL;
  }

  /**
   * @param string $name
   *
   * @return string|null
   */
  public function getVariable($name): ?string {
    return $this->variables[$name] ?? NULL;
  }

  /**
   * @param string $name
   *
   * @return string|null
   */
  public function getContext($name): ?string {
    return $this->context[$name] ?? NULL;
  }

  /**
   * @return \Drupal\user\UserInterface
   */
  public function getUser(): \Drupal\user\UserInterface {
    if (!$this->user) {
      $this->user = User::load($this->context['uid']);
    }
    return $this->user;
  }

  /**
   * @return int
   */
  public function getTimestamp(): int {
    return $this->context['timestamp'];
  }

}
