<?php

namespace Drupal\purge_check_test\Plugin\Purge\DiagnosticCheck;

use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckBase;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface;

/**
 * Checks if there is a purger plugin that invalidates an external cache.
 *
 * @PurgeDiagnosticCheck(
 *   id = "queuewarning",
 *   title = @Translation("Queue specific warning"),
 *   description = @Translation("A fake test to test the diagnostics api."),
 *   dependent_queue_plugins = {"b"},
 *   dependent_purger_plugins = {}
 * )
 */
class QueueSpecificWarningDiagnosticCheck extends DiagnosticCheckBase implements DiagnosticCheckInterface {

  /**
   * {@inheritdoc}
   */
  public function run() {
    $this->recommendation = $this->t("This is a queue warning for testing.");
    return self::SEVERITY_WARNING;
  }

}
