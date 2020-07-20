<?php

namespace Drupal\purge\Plugin\Purge\Purger\Exception;

/**
 * Diagnostic ERROR requires cache invalidation to be halted.
 *
 * Thrown by PurgersServiceInterface::invalidate after a diagnostic of type
 * SEVERITY_ERROR has been detected, which is established after calling
 * DiagnosticsServiceInterface::::isSystemOnFire. Errors by definition force
 * all cache invalidation to be prevented, until the user resolved the issue.
 *
 * @see \Drupal\purge\Plugin\Purge\Purger\PurgersServiceInterface::invalidate().
 */
class DiagnosticsException extends \Exception {}
