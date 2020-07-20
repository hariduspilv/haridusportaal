<?php

namespace Drupal\purge\Tests\Processor;

use Drupal\purge\Plugin\Purge\Processor\ProcessorInterface;
use Drupal\purge\Tests\KernelServiceTestBase;
use Drupal\purge\Tests\KernelTestBase;

/**
 * Tests \Drupal\purge\Plugin\Purge\Processor\ProcessorsService.
 *
 * @group purge
 * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsService
 * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsServiceInterface
 */
class ServiceTest extends KernelServiceTestBase {

  /**
   * The name of the service as defined in services.yml.
   *
   * @var string
   */
  protected $serviceId = 'purge.processors';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_processor_test'];

  /**
   * Set up the test.
   */
  public function setUp($switch_to_memory_queue = TRUE) {

    // Skip parent::setUp() as we don't want the service initialized here.
    KernelTestBase::setUp();
    $this->installConfig(['purge_processor_test']);
  }

  /**
   * Tests \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::count.
   */
  public function testCount() {
    $this->initializeService();
    $this->assertTrue($this->service instanceof \Countable);
    $this->assertEqual(2, count($this->service));
  }

  /**
   * Tests \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::get.
   */
  public function testGet() {
    $this->initializeService();
    $this->assertTrue($this->service->get('a') instanceof ProcessorInterface);
    $this->assertTrue($this->service->get('b') instanceof ProcessorInterface);
    $this->assertFalse($this->service->get('c'));
    $this->service->setPluginsEnabled(['c']);
    $this->assertTrue($this->service->get('c') instanceof ProcessorInterface);
  }

  /**
   * Tests the \Iterator implementation.
   *
   * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::current
   * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::key
   * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::next
   * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::rewind
   * @see \Drupal\purge\Plugin\Purge\Processor\ProcessorsService::valid
   */
  public function testIteration() {
    $this->initializeService();
    $this->assertIterator(
      ['a', 'b'],
      '\Drupal\purge\Plugin\Purge\Processor\ProcessorInterface'
    );
  }

}
