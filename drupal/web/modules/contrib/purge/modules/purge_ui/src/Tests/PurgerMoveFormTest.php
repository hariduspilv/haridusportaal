<?php

namespace Drupal\purge_ui\Tests;

use Drupal\Core\Url;
use Drupal\purge\Tests\WebTestBase;

/**
 * Tests \Drupal\purge_ui\Form\PurgerMoveForm.
 *
 * @group purge_ui
 */
class PurgerMoveFormTest extends WebTestBase {

  /**
   * The Drupal user entity.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * The route that renders the form (moving down).
   *
   * @var string
   */
  protected $routeDown = 'purge_ui.purger_move_down_form';

  /**
   * The route that renders the form (moving up).
   *
   * @var string
   */
  protected $routeUp = 'purge_ui.purger_move_up_form';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['purge_purger_test', 'purge_ui'];

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
    $args_down = ['id' => 'id0', 'direction' => 'down'];
    $args_up = ['id' => 'id0', 'direction' => 'up'];
    $this->initializePurgersService(['a']);
    $this->drupalGet(Url::fromRoute($this->routeDown, $args_down));
    $this->assertResponse(403);
    $this->drupalGet(Url::fromRoute($this->routeUp, $args_up));
    $this->assertResponse(403);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->routeDown, $args_down));
    $this->assertResponse(200);
    $this->drupalGet(Url::fromRoute($this->routeUp, $args_up));
    $this->assertResponse(200);
    $args_down = ['id' => 'doesnotexist', 'direction' => 'down'];
    $args_up = ['id' => 'doesnotexist', 'direction' => 'up'];
    $this->drupalGet(Url::fromRoute($this->routeDown, $args_down));
    $this->assertResponse(404);
    $this->drupalGet(Url::fromRoute($this->routeUp, $args_up));
    $this->assertResponse(404);
  }

  /**
   * Tests that the "No" cancel button closes the dialog.
   *
   * @see \Drupal\purge_ui\Form\PurgerMoveForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::closeDialog
   */
  public function testNo() {
    $args_down = ['id' => 'id0', 'direction' => 'down'];
    $args_up = ['id' => 'id0', 'direction' => 'up'];
    $this->initializePurgersService(['a']);
    $this->drupalLogin($this->adminUser);
    $this->drupalGet(Url::fromRoute($this->routeDown, $args_down));
    $this->assertRaw('No');
    $this->drupalGet(Url::fromRoute($this->routeUp, $args_up));
    $this->assertRaw('No');
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->routeDown, $args_down)->toString(), [], ['op' => 'No']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->routeUp, $args_up)->toString(), [], ['op' => 'No']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual(2, count($json));
  }

  /**
   * Tests that 'Yes!', moves the purger in order and closes the window.
   *
   * @see \Drupal\purge_ui\Form\PurgerDeleteForm::buildForm
   * @see \Drupal\purge_ui\Form\CloseDialogTrait::deletePurger
   */
  public function testMove() {
    $down = ['id' => 'id0', 'direction' => 'down'];
    $up = ['id' => 'id2', 'direction' => 'up'];
    $this->initializePurgersService(['a', 'b', 'c']);
    $this->drupalLogin($this->adminUser);
    // Test that the initial order of the purgers is exactly as configured.
    $this->assertEqual(['a', 'b', 'c'], array_values($this->purgePurgers->getPluginsEnabled()));
    // Test the 'down' variant of the move form.
    $this->drupalGet(Url::fromRoute($this->routeDown, $down));
    $this->assertRaw('Do you want to move Purger A down in the execution order?');
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->routeDown, $down)->toString(), [], ['op' => 'Yes!']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual('redirect', $json[2]['command']);
    $this->purgePurgers->reload();
    $this->assertEqual(['b', 'a', 'c'], array_values($this->purgePurgers->getPluginsEnabled()));
    // Test the 'up' variant of the move form.
    $this->drupalGet(Url::fromRoute($this->routeUp, $up));
    $this->assertRaw('Do you want to move Purger C up in the execution order?');
    $json = $this->drupalPostAjaxForm(Url::fromRoute($this->routeUp, $up)->toString(), [], ['op' => 'Yes!']);
    $this->assertEqual('closeDialog', $json[1]['command']);
    $this->assertEqual('redirect', $json[2]['command']);
    $this->purgePurgers->reload();
    $this->assertEqual(['b', 'c', 'a'], array_values($this->purgePurgers->getPluginsEnabled()));
  }

}
