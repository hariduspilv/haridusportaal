<?php

namespace Drupal\purge\Plugin\Purge\Invalidation\Exception;

/**
 * Thrown when no purgers support the requested type.
 *
 * @see \Drupal\purge\Plugin\Purge\Invalidation\InvalidationsServiceInterface::get
 */
class TypeUnsupportedException extends \Exception {}
