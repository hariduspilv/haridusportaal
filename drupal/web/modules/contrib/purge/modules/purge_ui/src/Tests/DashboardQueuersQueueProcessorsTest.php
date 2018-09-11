<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge_ui\Tests\DashboardTestBase;

/**
 * Tests \Drupal\purge_ui\Controller\DashboardController::buildQueuersQueueProcessors().
 *
 * @group purge_ui
 */
class DashboardQueuersQueueProcessorsTest extends DashboardTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_queuer_test', 'purge_processor_test'];

  /**
   * Test the queuers section of the dashboard.
   *
   * @see \Drupal\purge_ui\Controller\DashboardController::buildQueuersQueueProcessors
   */
  public function testQueuersSection() {
    $this->drupalLogin($this->admin_user);
    $this->drupalGet($this->route);
    $this->assertRaw('Queuers add items to the queue upon certain events, that processors process later on.');
    $this->assertRaw('Queuer A');
    $queuer_a_route_params = ['id' => 'a'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_detail_form', $queuer_a_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.queuer_config_dialog_form', $queuer_a_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_delete_form', $queuer_a_route_params)->toString());
    $this->assertRaw('Queuer B');
    $queuer_b_route_params = ['id' => 'b'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_detail_form', $queuer_b_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.queuer_config_dialog_form', $queuer_b_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_delete_form', $queuer_b_route_params)->toString());
    $this->assertNoRaw('Queuer C');
    $queuer_c_route_params = ['id' => 'c'];
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.queuer_detail_form', $queuer_c_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.queuer_config_dialog_form', $queuer_c_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.queuer_delete_form', $queuer_c_route_params)->toString());
    $this->initializeQueuersService(['withform']);
    $this->drupalGet($this->route);
    $this->assertRaw('Queuer with form');
    $queuer_withform_route_params = ['id' => 'withform'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_detail_form', $queuer_withform_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_config_dialog_form', $queuer_withform_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queuer_delete_form', $queuer_withform_route_params)->toString());

    $this->assertRaw('Add queuer');
  }

  /**
   * Test the queue section of the dashboard.
   *
   * @see \Drupal\purge_ui\Controller\DashboardController::buildQueuersQueueProcessors
   */
  public function testQueueSection() {
    $this->drupalLogin($this->admin_user);
    $this->drupalGet($this->route);
    $this->assertRaw("Memory");
    $this->assertText("Inspect");
    $this->assertText("Change engine");
    $this->assertText("Empty");
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queue_detail_form')->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queue_browser_form')->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queue_change_form')->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.queue_empty_form')->toString());
  }

  /**
   * Test the processors section of the dashboard.
   *
   * @see \Drupal\purge_ui\Controller\DashboardController::buildQueuersQueueProcessors
   */
  public function testProcessorsSection() {
    $this->drupalLogin($this->admin_user);
    $this->drupalGet($this->route);
    $this->assertRaw('Processors are responsible for emptying the queue and putting the purgers to work each time they process. Processors can work the queue constantly or at timed intervals, it is up to you to configure a policy that makes sense for the traffic nature of your website. Multiple processors will not lead to any parallel-processing or conflicts, instead it simply means the queue is checked more often.');
    $this->assertRaw('Processor A');
    $processor_a_route_params = ['id' => 'a'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_detail_form', $processor_a_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.processor_config_dialog_form', $processor_a_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_delete_form', $processor_a_route_params)->toString());
    $this->assertRaw('Processor B');
    $processor_b_route_params = ['id' => 'b'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_detail_form', $processor_b_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.processor_config_dialog_form', $processor_b_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_delete_form', $processor_b_route_params)->toString());
    $this->assertNoRaw('Processor C');
    $processor_c_route_params = ['id' => 'c'];
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.processor_detail_form', $processor_c_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.processor_config_dialog_form', $processor_c_route_params)->toString());
    $this->assertNoLinkByHref(Url::fromRoute('purge_ui.processor_delete_form', $processor_c_route_params)->toString());
    $this->initializeProcessorsService(['withform']);
    $this->drupalGet($this->route);
    $this->assertRaw('Processor with form');
    $processor_withform_route_params = ['id' => 'withform'];
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_detail_form', $processor_withform_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_config_dialog_form', $processor_withform_route_params)->toString());
    $this->assertLinkByHref(Url::fromRoute('purge_ui.processor_delete_form', $processor_withform_route_params)->toString());

    $this->assertRaw('Add processor');
  }

}
