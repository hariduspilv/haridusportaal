<?php

namespace Drupal\purge\Plugin\Purge\DiagnosticCheck;

use Drupal\purge\ServiceInterface;
use Symfony\Component\DependencyInjection\ContainerAwareInterface;

/**
 * Describes a service that interacts with diagnostic checks.
 */
interface DiagnosticsServiceInterface extends ServiceInterface, ContainerAwareInterface, \Iterator, \Countable {

  /**
   * Get only SEVERITY_INFO level checks.
   *
   * @return \Iterator[]
   *   \Iterator object that yields DiagnosticCheckInterface instances.
   */
  public function filterInfo();

  /**
   * Get only SEVERITY_OK level checks.
   *
   * @return \Iterator[]
   *   \Iterator object that yields DiagnosticCheckInterface instances.
   */
  public function filterOk();

  /**
   * Get only SEVERITY_WARNING level checks.
   *
   * @return \Iterator[]
   *   \Iterator object that yields DiagnosticCheckInterface instances.
   */
  public function filterWarnings();

  /**
   * Get only SEVERITY_WARNING and SEVERITY_ERROR level checks.
   *
   * @return \Iterator[]
   *   \Iterator object that yields DiagnosticCheckInterface instances.
   */
  public function filterWarningAndErrors();

  /**
   * Get only SEVERITY_ERROR level checks.
   *
   * @return \Iterator[]
   *   \Iterator object that yields DiagnosticCheckInterface instances.
   */
  public function filterErrors();

  /**
   * Reports if any of the diagnostic checks report a SEVERITY_ERROR severity.
   *
   * This method provides a simple - boolean evaluable - way to determine if
   * a DiagnosticCheckInterface::SEVERITY_ERROR severity was reported by one of
   * the checks. If SEVERITY_ERROR was reported, purging cannot continue and
   * should happen once all problems are resolved.
   *
   * @return false|\Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface
   *   The SEVERITY_ERROR reporting check, or FALSE when everything was fine.
   */
  public function isSystemOnFire();

  /**
   * Reports if any of the diagnostic checks report a SEVERITY_WARNING severity.
   *
   * This method provides a - boolean evaluable - way to determine if a check
   * reported a DiagnosticCheckInterface::SEVERITY_WARNING. If SEVERITY_WARNING
   * was reported, cache invalidation can continue but it is important that the
   * site administrator gets notified.
   *
   * @return false|\Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface
   *   The SEVERITY_WARNING reporting check, or FALSE when everything was fine.
   */
  public function isSystemShowingSmoke();

  /**
   * Generate a status_messages #message_list argument array.
   *
   * @param \Iterator $checks
   *   Iterator yielding DiagnosticCheckInterface objects.
   *
   * @return array[]
   *   Array with typed arrays, in each typed array are messages.
   */
  public function toMessageList(\Iterator $checks);

  /**
   * Generate a Drupal-like requirements array.
   *
   * @param \Iterator $checks
   *   Iterator yielding DiagnosticCheckInterface objects.
   * @param bool $prefix_title
   *   When TRUE, this prefixes titles with "Purge" to mark their origin.
   *
   * @return array[]
   *   Array with Drupal-like requirement arrays as values.
   */
  public function toRequirementsArray(\Iterator $checks, $prefix_title = FALSE);

}
