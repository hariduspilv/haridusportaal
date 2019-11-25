<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge\Tests\WebTestBase;

/**
 * Tests \Drupal\purge_ui\Form\QueueChangeForm.
 *
 * @group purge_ui
 */
class QueueChangeFormTest extends WebTestBase {

  /**
   * The Drupal user entity.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * The route that renders the form.
   *
   * @var string
   */
  protected $route = 'purge_ui.queue_change_form';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_queue_test', 'purge_ui'];

  /**
   * Setup the test.
   */
  public function setUp($switch_to_memory_queue = TRUE) {
    parent::setUp($switch_to_memory_queue);
    $this->adminUser = $this->drupalCreateUser(['administer site configuration']);
  }

  /**
   * Tests permissions, the form controller and general form returning.
   */
  public function testAccess() {
    $this->drupalGet(Url::fromRoute($this->route, []));
    $this->assertResponse(403);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route, []));
    $this->assertResponse(200);
  }

  /**
   * Tests that the close button works and that changing queue works.
   *
   * @see \Drupal\purge_ui\Form\QueueDetailForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testChangeForm() {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route, []));
    // Assert some of the page presentation.
    $this->assertRaw('Change queue engine');
    $this->assertRaw('The queue engine is the underlying plugin which stores');
    $this->assertRaw('when you change the queue, it will be emptied as well');
    $this->assertRaw('Description');
    $this->assertRaw('Cancel');
    $this->assertRaw('Change');
    // Assert that 'memory' is selected queue.
    $this->assertFieldChecked('edit-plugin-id-memory');
    // Assert that submitting a different queue changes it.
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route, [])->toString(), [], ['op' => 'Change', 'plugin_id' => 'b']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual('redirect', $json[2]['command']);
    $this->assertEqual(3, count($json));
    $this->drupalPostForm(Url::fromRoute($this->route, []), ['plugin_id' => 'b'], 'Change');
    $this->drupalGet(Url::fromRoute($this->route, []));
    $this->assertFieldChecked('edit-plugin-id-b');
    // // Assert that closing the dialog functions as expected.
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route, [])->toString(), [], ['op' => 'Cancel']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
  }

}
