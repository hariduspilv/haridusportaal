<?php

namespace Drupal\sitemap\Plugin\Sitemap;

use Drupal\Core\Form\FormStateInterface;
use Drupal\sitemap\SitemapBase;
use Drupal\system\Entity\Menu as MenuEntity;
use Drupal\Core\Menu\MenuTreeParameters;

/**
 * Provides a sitemap for an individual menu.
 *
 * @Sitemap(
 *   id = "menu",
 *   title = @Translation("Menu name"),
 *   description = @Translation("Menu description"),
 *   settings = {
 *     "title" = "",
 *     "show_disabled" = FALSE,
 *   },
 *   deriver = "Drupal\sitemap\Plugin\Derivative\MenuSitemapDeriver",
 *   enabled = FALSE,
 *   menu = "",
 * )
 */
class Menu extends SitemapBase {

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form = parent::settingsForm($form, $form_state);

    // Provide the menu name as the default title.
    $menu_name = $this->getPluginDefinition()['menu'];
    $menu = \Drupal::entityTypeManager()->getStorage('menu')->load($menu_name);
    $form['title']['#default_value'] = $this->settings['title'] ?: $menu->label();

    $form['show_disabled'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Show disabled menu items'),
      '#default_value' => isset($this->settings['show_disabled']) ? $this->settings['show_disabled'] : FALSE,
      '#description' => $this->t('When selected, disabled menu links will also be shown.'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function view() {
    $menuLinkTree = \Drupal::service('sitemap.menu.link_tree');
    $menu_id = $this->pluginDefinition['menu'];
    $menu = MenuEntity::load($menu_id);
    // Retrieve the expanded tree.
    $parameters = new MenuTreeParameters();
    if (!$this->settings['show_disabled']) {
      $parameters->onlyEnabledLinks();
    }

    $tree = $menuLinkTree->load($menu_id, $parameters);
    $manipulators = [
      ['callable' => 'menu.default_tree_manipulators:checkAccess'],
      ['callable' => 'menu.default_tree_manipulators:generateIndexAndSort'],
    ];
    $tree = $menuLinkTree->transform($tree, $manipulators);

    // Add an alter hook so that other modules can manipulate the
    // menu tree prior to rendering.
    // @TODO: Document
    $alter_mid = preg_replace('/[^a-z0-9_]+/', '_', $menu_id);
    \Drupal::moduleHandler()->alter(['sitemap_menu_tree', 'sitemap_menu_tree_' . $alter_mid], $tree, $menu);

    $menu_display = $menuLinkTree->build($tree);

    return [
      '#theme' => 'sitemap_item',
      '#title' => $this->settings['title'],
      '#content' => $menu_display,
      '#sitemap' => $this,
    ];
  }

}
