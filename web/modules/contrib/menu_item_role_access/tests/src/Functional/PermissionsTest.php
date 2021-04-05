<?php

namespace Drupal\Tests\menu_item_role_access\Functional;

use Drupal\system\Entity\Menu;
use Drupal\Tests\BrowserTestBase;
use Drupal\Core\Url;
use Drupal\user\Entity\User;

/**
 * Tests handling of menu links hierarchies.
 *
 * @group Menu
 */
class PermissionsTest extends BrowserTestBase {

  /**
   * {@inheritdoc}
   */
  protected $defaultTheme = 'stark';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'router_test',
    'menu_ui',
    'menu_link_content',
    'menu_item_role_access',
  ];

  /**
   * User with 'administer menu' and 'link to any page' permission.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * User with only 'administer menu' permission.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $noAccessUser;

  /**
   * The menu link plugin manager.
   *
   * @var \Drupal\Core\Menu\MenuLinkManagerInterface
   */
  protected $menuLinkManager;

  /**
   * The machine name of the menu.
   *
   * @var string
   */
  protected $menuName;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->adminUser = $this->drupalCreateUser(['administer menu', 'edit menu_item_role_access']);
    $this->noAccessUser = $this->drupalCreateUser(['administer menu']);
    $this->drupalLogin($this->adminUser);

    $this->menuLinkManager = \Drupal::service('plugin.manager.menu.link');
    $this->menuName = 'menu_test';

    Menu::create([
      'id' => $this->menuName,
      'label' => 'Test menu',
      'description' => 'Description text',
    ])->save();
  }

  /**
   * Assert that a our field to control access exists.
   */
  public function testMenuItemRoleAccessFieldExists() {
    $this->getToAddLinkPage($this->adminUser);
    // Check our field exists.
    $this->assertSession()->elementExists('css', '#edit-menu-item-roles-wrapper');
  }

  /**
   * Assert that a our field to control access does not exist.
   */
  public function testMenuItemRoleAccessFieldNoPermission() {
    $this->getToAddLinkPage($this->noAccessUser);
    // Check our field exists.
    $this->assertSession()->elementNotExists('css', '#edit-menu-item-roles-wrapper');
  }

  /**
   * Goes through the process to get to the add link page.
   *
   * @param \Drupal\user\Entity\User $user
   *   A user who exists within the system.
   */
  private function getToAddLinkPage(User $user) {
    // Log in the administrator.
    $this->drupalLogin($user);
    // Test the 'Add link' local action.
    $this->drupalGet(Url::fromRoute('entity.menu.edit_form', ['menu' => $this->menuName]));
    $this->clickLink('Add link');
  }

}
