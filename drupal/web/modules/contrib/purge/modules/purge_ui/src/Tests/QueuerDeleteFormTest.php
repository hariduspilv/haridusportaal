<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge\Tests\WebTestBase;

/**
 * Tests \Drupal\purge_ui\Form\QueuerDeleteForm.
 *
 * @group purge_ui
 */
class QueuerDeleteFormTest extends WebTestBase {

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
  protected $route = 'purge_ui.queuer_delete_form';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_ui', 'purge_queuer_test'];

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
    $this->drupalGet(Url::fromRoute($this->route, ['id' => 'a']));
    $this->assertResponse(403);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route, ['id' => 'a']));
    $this->assertResponse(200);
    $this->drupalGet(Url::fromRoute($this->route, ['id' => 'c']));
    $this->assertResponse(404);
    $this->drupalGet(Url::fromRoute($this->route, ['id' => "doesnotexist"]));
    $this->assertResponse(404);
  }

  /**
   * Tests that the "No" cancel button closes the dialog.
   *
   * @see \Drupal\purge_ui\Form\QueuerDeleteForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testNo() {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route, ['id' => 'a']));
    $this->assertRaw('No');
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route, ['id' => 'a'])->toString(), [], ['op' => 'No']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
  }

  /**
   * Tests that 'Yes, delete..', deletes the queuer and closes the window.
   *
   * @see \Drupal\purge_ui\Form\QueuerDeleteForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testDeleteQueuer() {
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->route, ['id' => 'a']));
    $this->assertRaw('Yes, delete this queuer!');
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->route, ['id' => 'a'])->toString(), [], ['op' => 'Yes, delete this queuer!']);
    $this->assertEqual('redirect', $json[1]['command']);
    $this->assertEqual('closeDialog', $json[2]['command']);
    $this->assertEqual(3, count($json));
  }

}
