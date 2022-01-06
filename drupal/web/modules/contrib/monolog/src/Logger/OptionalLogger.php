<?php

declare(strict_types=1);

namespace Drupal\monolog\Logger;

use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

/**
 * A logger that is always present.
 *
 * @internal This class is not part of the public API.
 */
class OptionalLogger {

  /**
   * A wrapped value.
   *
   * @var mixed|null
   */
  private $value = NULL;

  /**
   * OptionalLogger constructor.
   *
   * @param mixed|null $value
   *   A wrapped value.
   */
  private function __construct($value = NULL) {
    $this->value = $value;
  }

  /**
   * Creste an OptionalLogger instance with a value.
   *
   * @param mixed $value
   *   A wrapped value.
   *
   * @return static
   *   An OptionalLogger instance with a value.
   */
  public static function of($value) {
    return new static($value);
  }

  /**
   * Creste an OptionalLogger instance without a value.
   *
   * @return static
   *   An OptionalLogger instance without a value.
   */
  public static function none() {
    return new static();
  }

  /**
   * Takes the wrapped value and a function and sticks them together.
   *
   * @param callable $fn
   *   The next function to call.
   *
   * @return $this
   */
  public function bind(callable $fn): self {
    if (!is_null($this->value)) {
      return $fn($this->value);
    }

    return $this;
  }

  /**
   * Return the wrapped value or a NullLogger if value is NULL.
   *
   * @return \Psr\Log\LoggerInterface
   *   The wrapped value or a NullLogger if value is NULL.
   */
  public function get(): LoggerInterface {
    return $this->value ?? new NullLogger();
  }

}
