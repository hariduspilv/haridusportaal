<?php

namespace Drupal\purge_drush\Commands;

use Consolidation\AnnotatedCommand\AnnotationData;
use Consolidation\OutputFormatters\StructuredData\RowsOfFields;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsServiceInterface;
use Drush\Commands\DrushCommands;
use Symfony\Component\Console\Input\InputInterface;

/**
 * Generate a diagnostic self-service report.
 */
class DiagnosticsCommand extends DrushCommands {

  /**
   * The 'purge.diagnostics' service.
   *
   * @var \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsServiceInterface
   */
  protected $purgeDiagnostics;

  /**
   * Construct a DiagnosticsCommand object.
   *
   * @param \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsServiceInterface $purge_diagnostics
   *   The purge diagnostics service.
   */
  public function __construct(DiagnosticsServiceInterface $purge_diagnostics) {
    parent::__construct();
    $this->purgeDiagnostics = $purge_diagnostics;
  }

  /**
   * Only add @default-fields for the table format.
   *
   * @hook init p:diagnostics
   */
  public function addDefaultTableFields(InputInterface $input, AnnotationData $annotationData) {
    if ($input->getOption('format') == 'table') {
      $annotationData['default-fields'] = 'title,recommendation,value,severity';
    }
  }

  /**
   * Generate a diagnostic self-service report.
   *
   * @param array $options
   *   Associative array of options whose values come from Drush.
   *
   * @usage drush p:diagnostics
   *   Build the diagnostic report as a table.
   * @usage drush p:diagnostics --format=json
   *   Export as JSON.
   * @usage drush p:diagnostics --format=yaml
   *   Export as YAML.
   *
   * @command p:diagnostics
   * @aliases pdia,p-diagnostics
   * @field-labels
   *   id: Id
   *   title: Title
   *   description: Description
   *   recommendation: Recommendation
   *   value: Value
   *   severity: Severity
   *   severity_int: SevInt
   *   blocks_processing: Blocking?
   *
   * @return \Consolidation\OutputFormatters\StructuredData\RowsOfFields
   *   Row-based structure of data.
   */
  public function diagnostics(array $options = ['format' => 'table']) {
    $rows = [];
    foreach ($this->purgeDiagnostics as $check) {
      $rows[(string) $check->getPluginId()] = [
        'id' => (string) $check->getPluginId(),
        'title' => (string) $check->getTitle(),
        'value' => (string) $check->getValue(),
        'severity_int' => $check->getSeverity(),
        'severity' => (string) $check->getSeverityString(),
        'description' => (string) $check->getDescription(),
        'recommendation' => (string) $check->getRecommendation(),
        'blocks_processing' => $check->getSeverity() === DiagnosticCheckInterface::SEVERITY_ERROR,
      ];
    }
    return new RowsOfFields($rows);
  }

}
