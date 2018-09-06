<?php

namespace Drupal\purge\Tests\DiagnosticCheck;

use Drupal\purge\Tests\KernelServiceTestBase;
use Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticCheckInterface;

/**
 * Tests \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService
 * @see \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsServiceInterface
 */
class ServiceSmokeAndFireTest extends KernelServiceTestBase {
  protected $serviceId = 'purge.diagnostics';
  public static $modules = ['purge_purger_test', 'purge_processor_test'];

  /**
   * Set up the test.
   */
  public function setUp() {

    // Skip parent::setUp() as we don't want the service initialized here.
    KernelServiceTestBase::setUp();
    $this->installConfig(['purge_processor_test']);
  }

  /**
   * Tests \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::isSystemOnFire()
   */
  public function testIsSystemOnFireReturnsFalse() {
    $this->initializePurgersService(['ida' => 'a']);
    $this->initializeService();
    $this->assertFalse(is_object($this->service->isSystemOnFire()));
    $this->assertEqual($this->service->isSystemOnFire(), FALSE);
  }

  /**
   * Tests \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::isSystemOnFire()
   */
  public function testIsSystemOnFireReturnsCheck() {
    $this->initializePurgersService([]);
    $this->initializeService();
    // ERROR level check is expected now because we didn't load any purgers.
    $fire = $this->service->isSystemOnFire();
    $this->assertTrue(is_object($fire));
    if (is_object($fire)) {
      $this->assertTrue($fire instanceof DiagnosticCheckInterface);
    }
  }

  /**
   * Tests \Drupal\purge\Plugin\Purge\DiagnosticCheck\DiagnosticsService::isSystemShowingSmoke()
   */
  public function testIsSystemShowingSmokeReturnsFalse() {
    $this->initializePurgersService(['idb' => 'b']);
    $this->initializeService();
    $smoke = $this->service->isSystemShowingSmoke();
    $this->assertTrue(is_object($smoke));
    if (is_object($smoke)) {
      $this->assertTrue($smoke instanceof DiagnosticCheckInterface);
    }
  }

}
