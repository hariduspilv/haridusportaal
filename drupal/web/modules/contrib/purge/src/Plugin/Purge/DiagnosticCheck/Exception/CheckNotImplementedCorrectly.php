<?php

namespace Drupal\purge\Plugin\Purge\DiagnosticCheck\Exception;

/**
 * Thrown when ::run() is not returning a severity as mandated by the API.
 *
 * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface
 */
class CheckNotImplementedCorrectly extends \Exception {}
