<?php

namespace Drupal\purge\Plugin\Purge\DiagnosticCheck;

use Drupal\Core\Plugin\PluginBase;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\Exception\CheckNotImplementedCorrectly;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Describes a diagnostic check that tests a specific purging requirement.
 */
abstract class DiagnosticCheckBase extends PluginBase implements DiagnosticCheckInterface {

  /**
   * The title of the check as described in the plugin's metadata.
   *
   * @var \Drupal\Core\StringTranslation\TranslatableMarkup
   */
  private $title;

  /**
   * The description of the check as described in the plugin's metadata.
   *
   * @var \Drupal\Core\StringTranslation\TranslatableMarkup
   */
  private $description;

  /**
   * The severity of the outcome of this check.
   *
   * This value corresponds to one of these constants:
   *    - DiagnosticCheckInterface::SEVERITY_INFO
   *    - DiagnosticCheckInterface::SEVERITY_OK
   *    - DiagnosticCheckInterface::SEVERITY_WARNING
   *    - DiagnosticCheckInterface::SEVERITY_ERROR.
   *
   * @var int
   */
  private $severity;

  /**
   * A recommendation matching the severity level, may contain NULL.
   *
   * @var \Drupal\Core\StringTranslation\TranslatableMarkup
   */
  protected $recommendation;

  /**
   * Optional check outcome / value (e.g. version numbers), may contain NULL.
   *
   * @var mixed
   */
  protected $value;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition
    );
  }

  /**
   * Late runtime helper to assure that ::run() got called (and only once).
   */
  protected function runCheck() {
    if (!is_null($this->severity)) {
      return;
    }
    $this->severity = $this->run();
    if (!is_int($this->severity)) {
      $class = $this->getPluginDefinition()['class'];
      throw new CheckNotImplementedCorrectly("Exected integer as return from $class::run()!");
    }
    if ($this->severity < -1 || $this->severity > 2) {
      $class = $this->getPluginDefinition()['class'];
      throw new CheckNotImplementedCorrectly("Invalid const returned by $class::run()!");
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getTitle() {
    $this->runCheck();
    if (is_null($this->title)) {
      $this->title = $this->getPluginDefinition()['title'];
    }
    return $this->title;
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    $this->runCheck();
    if (is_null($this->description)) {
      $this->description = $this->getPluginDefinition()['description'];
    }
    return $this->description;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeverity() {
    $this->runCheck();
    return $this->severity;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeverityString() {
    $this->runCheck();
    $mapping = [
      self::SEVERITY_INFO      => 'INFO',
      self::SEVERITY_OK        => 'OK',
      self::SEVERITY_WARNING   => 'WARNING',
      self::SEVERITY_ERROR     => 'ERROR',
    ];
    return $mapping[$this->getSeverity()];
  }

  /**
   * {@inheritdoc}
   */
  public function getRecommendation() {
    $this->runCheck();
    if ($this->recommendation) {
      return $this->recommendation;
    }
    else {
      return $this->getDescription();
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getValue() {
    $this->runCheck();
    return $this->value;
  }

  /**
   * {@inheritdoc}
   */
  public function getRequirementsArray() {
    $this->runCheck();
    return [
      'title' => (string) $this->getTitle(),
      'value' => (string) $this->getValue(),
      'description' => (string) $this->getRecommendation(),
      'severity_status' => strtolower($this->getSeverityString()),
      'severity' => $this->getRequirementsSeverity(),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getRequirementsSeverity() {
    static $mapping;
    $this->runCheck();
    if (is_null($mapping)) {
      include_once DRUPAL_ROOT . '/core/includes/install.inc';

      // Currently, our constants hold the exact same values as core's
      // requirement constants. However, as our diagnostic checks API is more
      // than just a objectification of hook_requirements we need to assure
      // that this lasts over time, and thus map the constants.
      $mapping = [
        self::SEVERITY_INFO      => REQUIREMENT_INFO,
        self::SEVERITY_OK        => REQUIREMENT_OK,
        self::SEVERITY_WARNING   => REQUIREMENT_WARNING,
        self::SEVERITY_ERROR     => REQUIREMENT_ERROR,
      ];
    }
    return $mapping[$this->getSeverity()];
  }

}
