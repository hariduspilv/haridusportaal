<?php

namespace Drupal\purge\Tests\DiagnosticCheck;

use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface;
use Drupal\purge\Tests\KernelServiceTestBase;

/**
 * Tests DiagnosticsService.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService
 * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsServiceInterface
 */
class ServiceTest extends KernelServiceTestBase {

  /**
   * The name of the service as defined in services.yml.
   *
   * @var string
   */
  protected $serviceId = 'purge.diagnostics';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'purge_purger_test',
    'purge_processor_test',
    'purge_check_test',
    'purge_check_error_test',
    'purge_check_warning_test',
  ];

  /**
   * The supported test severities.
   *
   * @var int[]
   *
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface::SEVERITY_INFO
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface::SEVERITY_OK
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface::SEVERITY_WARNING
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface::SEVERITY_ERROR
   */
  protected $severities = [
    DiagnosticCheckInterface::SEVERITY_INFO,
    DiagnosticCheckInterface::SEVERITY_OK,
    DiagnosticCheckInterface::SEVERITY_WARNING,
    DiagnosticCheckInterface::SEVERITY_ERROR,
  ];

  /**
   * The supported test severity statuses.
   *
   * @var string[]
   */
  protected $severityStatuses = [
    'info',
    'ok',
    'warning',
    'error',
  ];

  /**
   * The hook_requirements() severities from install.inc.
   *
   * @var int[]
   *
   * @see REQUIREMENT_INFO
   * @see REQUIREMENT_OK
   * @see REQUIREMENT_WARNING
   * @see REQUIREMENT_ERROR
   */
  protected $requirementSeverities = [];

  /**
   * Set up the test.
   */
  public function setUp() {

    // Skip parent::setUp() as we don't want the service initialized here.
    KernelServiceTestBase::setUp();
    $this->installConfig(['purge_processor_test']);
  }

  /**
   * Include install.inc and initialize $this->requirementSeverities.
   */
  protected function initializeRequirementSeverities() {
    if (empty($this->requirementSeverities)) {
      include_once DRUPAL_ROOT . '/core/includes/install.inc';
      $this->requirementSeverities[] = REQUIREMENT_INFO;
      $this->requirementSeverities[] = REQUIREMENT_OK;
      $this->requirementSeverities[] = REQUIREMENT_WARNING;
      $this->requirementSeverities[] = REQUIREMENT_ERROR;
    }
  }

  /**
   * Tests lazy loading of the 'purge.purger' and 'purge.queue' services.
   *
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::__construct
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::initializeChecks
   */
  public function testLazyLoadingOfDependencies() {
    $this->assertFalse($this->container->initialized('purge.purgers'));
    $this->assertFalse($this->container->initialized('purge.queue'));
    $this->initializeService();
    $this->assertFalse($this->container->initialized('purge.purgers'));
    $this->assertFalse($this->container->initialized('purge.queue'));

    // All the helpers on the service - except the constructor - lazy load the
    // services, but only when any of the check plugins require them. In this
    // case the 'memoryqueuewarning' plugin will trigger the queue and the
    // 'capacity' and 'purgersavailable' plugins will load 'purge.purgers'.
    $this->service->isSystemOnFire();
    $this->assertTrue($this->container->initialized('purge.purgers'));
    $this->assertTrue($this->container->initialized('purge.queue'));
  }

  /**
   * Tests DiagnosticsService::count.
   */
  public function testCount() {
    $this->initializeService();
    $this->assertTrue($this->service instanceof \Countable);
    $this->assertEqual(12, count($this->service));
  }

  /**
   * Tests the \Iterator implementation.
   *
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::current
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::key
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::next
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::rewind
   * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::valid
   */
  public function testIteration() {
    $this->initializeService();
    $this->assertIterator(
      [
        'queuersavailable',
        'purgersavailable',
        'maxage',
        'capacity',
        'processorsavailable',
        'memoryqueuewarning',
        'page_cache',
        'alwaysok',
        'alwaysinfo',
        'alwayserror',
        'alwayswarning',
        'queue_size',
      ],
      '\Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface'
    );
  }

  /**
   * Tests the various ::filter* methods.
   *
   * Covers:
   *   \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::filterInfo
   *   \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::filterOk
   *   \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::filterWarnings
   *   \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::filterWarningAndErrors
   *   \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::filterErrors.
   */
  public function testFilters() {
    $this->initializeService();
    $this->assertTrue($this->service->filterInfo() instanceof \Iterator);
    $this->assertTrue($this->service->filterInfo() instanceof \Countable);
    $this->assertTrue($this->service->filterOk() instanceof \Iterator);
    $this->assertTrue($this->service->filterOk() instanceof \Countable);
    $this->assertTrue($this->service->filterWarnings() instanceof \Iterator);
    $this->assertTrue($this->service->filterWarnings() instanceof \Countable);
    $this->assertTrue($this->service->filterWarningAndErrors() instanceof \Iterator);
    $this->assertTrue($this->service->filterWarningAndErrors() instanceof \Countable);
    $this->assertTrue($this->service->filterErrors() instanceof \Iterator);
    $this->assertTrue($this->service->filterErrors() instanceof \Countable);
    $this->assertEqual(1, count($this->service->filterInfo()));
    foreach ($this->service->filterInfo() as $check) {
      $this->assertTrue($check instanceof DiagnosticCheckInterface);
    }
    $this->assertEqual(3, count($this->service->filterOk()));
    foreach ($this->service->filterOk() as $check) {
      $this->assertTrue($check instanceof DiagnosticCheckInterface);
    }
    $this->assertEqual(6, count($this->service->filterWarnings()));
    foreach ($this->service->filterWarnings() as $check) {
      $this->assertTrue($check instanceof DiagnosticCheckInterface);
    }
    $this->assertEqual(8, count($this->service->filterWarningAndErrors()));
    foreach ($this->service->filterWarningAndErrors() as $check) {
      $this->assertTrue($check instanceof DiagnosticCheckInterface);
    }
    $this->assertEqual(2, count($this->service->filterErrors()));
    foreach ($this->service->filterErrors() as $check) {
      $this->assertTrue($check instanceof DiagnosticCheckInterface);
    }
  }

  /**
   * Tests DiagnosticsService::isSystemOnFire.
   */
  public function testIsSystemOnFire() {
    $this->initializePurgersService(['ida' => 'a']);
    $this->service->reload();
    $this->assertTrue($this->service->isSystemOnFire() instanceof DiagnosticCheckInterface);
    $possibilities = ['alwayserror', 'maxage'];
    $this->assertTrue(in_array($this->service->isSystemOnFire()->getPluginId(), $possibilities));
  }

  /**
   * Tests DiagnosticsService::isSystemShowingSmoke.
   */
  public function testIsSystemShowingSmoke() {
    $this->assertTrue($this->service->isSystemShowingSmoke() instanceof DiagnosticCheckInterface);
    $possibilities = [
      'alwayswarning',
      'capacity',
      'queuersavailable',
      'page_cache',
    ];
    $this->assertTrue(in_array($this->service->isSystemShowingSmoke()->getPluginId(), $possibilities));
  }

  /**
   * Tests DiagnosticsService::toMessageList.
   */
  public function testToMessageList() {
    $this->initializeRequirementSeverities();
    $this->initializeService();
    $list = $this->service->toMessageList($this->service);
    $this->assertTrue(is_array($list));
    $this->assertEqual(4, count($list));
    $this->assertTrue(isset($list['info']));
    $this->assertTrue(isset($list['ok']));
    $this->assertTrue(isset($list['warning']));
    $this->assertTrue(isset($list['error']));
    $this->assertEqual(1, count($list['info']));
    $this->assertEqual(3, count($list['ok']));
    $this->assertEqual(6, count($list['warning']));
    $this->assertEqual(2, count($list['error']));
    foreach ($list as $type => $msgs) {
      $this->assertTrue(in_array($type, ['info', 'ok', 'warning', 'error']));
      $this->assertTrue(is_array($msgs));
      foreach ($msgs as $msg) {
        $this->assertTrue(is_string($msg) && strlen($msg));
      }
    }
  }

  /**
   * Tests DiagnosticsService::toRequirementsArray.
   */
  public function testToRequirementsArray() {
    $this->initializeRequirementSeverities();
    $this->initializeService();
    // Test the standard output as Drupal expects it.
    $requirements = $this->service->toRequirementsArray($this->service);
    $this->assertEqual(12, count($requirements));
    foreach ($requirements as $id => $requirement) {
      $this->assertTrue(is_string($id));
      $this->assertFalse(empty($id));
      $this->assertTrue(is_string($requirement['title']) || ($requirement['title'] instanceof TranslatableMarkup));
      $this->assertFalse(strpos($requirement['title'], 'Purge: ') === 0);
      $this->assertFalse(empty($requirement['title']));
      $this->assertTrue((is_string($requirement['description']) || $requirement['description'] instanceof TranslatableMarkup));
      $this->assertFalse(empty($requirement['description']));
      $this->assertTrue(in_array($requirement['severity_status'], $this->severityStatuses));
      $this->assertTrue(in_array($requirement['severity'], $this->requirementSeverities));
    }
    // Test that the $prefix_title parameter works as expected.
    foreach ($this->service->toRequirementsArray($this->service, TRUE) as $requirement) {
      $this->assertTrue(strpos($requirement['title'], 'Purge: ') === 0);
    }
  }

}
