<?php

namespace Drupal\structure_sync\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\structure_sync\StructureSyncHelper;
use Drupal\Core\Form\FormStateInterface;
use Drupal\menu_link_content\Entity\MenuLinkContent;

/**
 * Controller for syncing menu links.
 */
class MenuLinksController extends ControllerBase {

  private $config;

  /**
   * Constructor for menu links controller.
   */
  public function __construct() {
    $this->config = $this->getEditableConfig();
    $this->entityTypeManager();
  }

  /**
   * Gets the editable version of the config.
   */
  private function getEditableConfig() {
    $this->config('structure_sync.data');

    return $this->configFactory->getEditable('structure_sync.data');
  }

  /**
   * Function to export menu links.
   */
  public function exportMenuLinks(array $form = NULL, FormStateInterface $form_state = NULL) {
    StructureSyncHelper::logMessage('Menu links export started');

    if (is_object($form_state) && $form_state->hasValue('export_menu_list')) {
      $menu_list = $form_state->getValue('export_menu_list');
      $menu_list = array_filter($menu_list, 'is_string');
    }

    $this->config->clear('menus')->save();

    if (isset($menu_list)) {
      $menuLinks = [];

      foreach ($menu_list as $menu_name) {
        $menuLinks = array_merge($this->entityTypeManager
          ->getStorage('menu_link_content')
          ->loadByProperties(['menu_name' => $menu_name]), $menuLinks);
      }
    }
    else {
      $menuLinks = $this->entityTypeManager()->getStorage('menu_link_content')
        ->loadMultiple();
    }

    $customMenuLinks = [];
    foreach ($menuLinks as $menuLink) {
      $customMenuLinks[] = [
        'menu_name' => $menuLink->menu_name->value,
        'title' => $menuLink->title->value,
        'parent' => $menuLink->parent->value,
        'uri' => $menuLink->link->uri,
        'link_title' => $menuLink->link->title,
        'description' => $menuLink->description->value,
        'enabled' => $menuLink->enabled->value,
        'expanded' => $menuLink->expanded->value,
        'weight' => $menuLink->weight->value,
        'langcode' => $menuLink->langcode->value,
        'uuid' => $menuLink->uuid(),
      ];

      if (array_key_exists('drush', $form) && $form['drush'] === TRUE) {
        drush_log('Exported "' . $menuLink->title->getValue()[0]['value'] . '" of menu "' . $menuLink->menu_name->getValue()[0]['value'] . '"', 'ok');
      }
      StructureSyncHelper::logMessage('Exported "' . $menuLink->title->value . '" of menu "' . $menuLink->menu_name->value . '"');
    }

    $this->config->set('menus', $customMenuLinks)->save();

    drupal_set_message($this->t('The menu links have been successfully exported.'));
    StructureSyncHelper::logMessage('Menu links exported');
  }

  /**
   * Function to import menu links.
   *
   * When this function is used without the designated form, you should assign
   * an array with a key value pair for form with key 'style' and value 'full',
   * 'safe' or 'force' to apply that import style.
   */
  public function importMenuLinks(array $form, FormStateInterface $form_state = NULL) {
    StructureSyncHelper::logMessage('Menu links import started');

    // Check if the there is a selection made in a form for what menus need to
    // be imported.
    if (is_object($form_state) && $form_state->hasValue('import_menu_list')) {
      $menusSelected = $form_state->getValue('import_menu_list');
      $menusSelected = array_filter($menusSelected, 'is_string');
    }
    if (array_key_exists('style', $form)) {
      $style = $form['style'];
    }
    else {
      StructureSyncHelper::logMessage('No style defined on menu links import', 'error');
      return;
    }

    StructureSyncHelper::logMessage('Using "' . $style . '" style for menu links import');

    // Get menu links from config.
    $menusConfig = $this->config->get('menus');

    $menus = [];

    if (isset($menusSelected)) {
      foreach ($menusConfig as $menu) {
        if (in_array($menu['menu_name'], array_keys($menusSelected))) {
          $menus[] = $menu;
        }
      }
    }
    else {
      $menus = $menusConfig;
    }

    if (array_key_exists('drush', $form) && $form['drush'] === TRUE) {
      $context = [];
      $context['drush'] = TRUE;

      switch ($style) {
        case 'full':
          self::deleteDeletedMenuLinks($menus, $context);
          self::importMenuLinksFull($menus, $context);
          self::menuLinksImportFinishedCallback(NULL, NULL, NULL);
          break;

        case 'safe':
          self::importMenuLinksSafe($menus, $context);
          self::menuLinksImportFinishedCallback(NULL, NULL, NULL);
          break;

        case 'force':
          self::deleteMenuLinks($context);
          self::importMenuLinksForce($menus, $context);
          self::menuLinksImportFinishedCallback(NULL, NULL, NULL);
          break;
      }

      return;
    }

    // Import the menu links with the chosen style of importing.
    switch ($style) {
      case 'full':
        $batch = [
          'title' => $this->t('Importing menu links...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\MenuLinksController::deleteDeletedMenuLinks',
              [$menus],
            ],
            [
              '\Drupal\structure_sync\Controller\MenuLinksController::importMenuLinksFull',
              [$menus],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\MenuLinksController::menuLinksImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      case 'safe':
        $batch = [
          'title' => $this->t('Importing menu links...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\MenuLinksController::importMenuLinksSafe',
              [$menus],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\MenuLinksController::menuLinksImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      case 'force':
        $batch = [
          'title' => $this->t('Importing menu links...'),
          'operations' => [
            [
              '\Drupal\structure_sync\Controller\MenuLinksController::deleteMenuLinks',
              [],
            ],
            [
              '\Drupal\structure_sync\Controller\MenuLinksController::importMenuLinksForce',
              [$menus],
            ],
          ],
          'finished' => '\Drupal\structure_sync\Controller\MenuLinksController::menuLinksImportFinishedCallback',
        ];
        batch_set($batch);
        break;

      default:
        StructureSyncHelper::logMessage('Style not recognized', 'error');
        break;
    }
  }

  /**
   * Function to delete the menu links that should be removed in this import.
   */
  public static function deleteDeletedMenuLinks($menus, &$context) {
    $uuidsInConfig = [];
    foreach ($menus as $menuLink) {
      $uuidsInConfig[] = $menuLink['uuid'];
    }

    if (!empty($uuidsInConfig)) {
        $query = StructureSyncHelper::getEntityQuery('menu_link_content');
        $query->condition('uuid', $uuidsInConfig, 'NOT IN');
        $ids = $query->execute();
        $controller = StructureSyncHelper::getEntityManager()
            ->getStorage('menu_link_content');
        $entities = $controller->loadMultiple($ids);
        $controller->delete($entities);
    }

    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Deleted menu links that were not in config', 'ok');
    }
    StructureSyncHelper::logMessage('Deleted menu links that were not in config');
  }

  /**
   * Function to fully import the menu links.
   *
   * Basically a safe import with update actions for already existing menu
   * links.
   */
  public static function importMenuLinksFull($menus, &$context) {
    $uuidsInConfig = [];
    foreach ($menus as $menuLink) {
      $uuidsInConfig[] = $menuLink['uuid'];
    }
    $entities = [];
    if (!empty($uuidsInConfig)) {
        $query = StructureSyncHelper::getEntityQuery('menu_link_content');
        $query->condition('uuid', $uuidsInConfig, 'IN');
        $ids = $query->execute();
        $controller = StructureSyncHelper::getEntityManager()
            ->getStorage('menu_link_content');
        $entities = $controller->loadMultiple($ids);
    }

    $parents = array_column($menus, 'parent');
    foreach ($parents as &$parent) {
      if (!is_null($parent)) {
        if (($pos = strpos($parent, ":")) !== FALSE) {
          $parent = substr($parent, $pos + 1);
        }
        else {
          $parent = NULL;
        }
      }
    }

    $idsDone = [];
    $idsLeft = [];
    $firstRun = TRUE;
    $context['sandbox']['max'] = count($menus);
    $context['sandbox']['progress'] = 0;
    while ($firstRun || count($idsLeft) > 0) {
      foreach ($menus as $menuLink) {
        $query = StructureSyncHelper::getEntityQuery('menu_link_content');
        $query->condition('uuid', $menuLink['uuid']);
        $ids = $query->execute();

        $currentParent = $menuLink['parent'];
        if (!is_null($currentParent)) {
          if (($pos = strpos($currentParent, ":")) !== FALSE) {
            $currentParent = substr($currentParent, $pos + 1);
          }
        }

        if (!in_array($menuLink['uuid'], $idsDone)
          && ($menuLink['parent'] === NULL
            || !in_array($menuLink['parent'], $parents)
            || in_array($currentParent, $idsDone))
        ) {
          if (count($ids) <= 0) {
            MenuLinkContent::create([
              'title' => $menuLink['title'],
              'link' => [
                'uri' => $menuLink['uri'],
                'title' => $menuLink['link_title'],
              ],
              'menu_name' => $menuLink['menu_name'],
              'expanded' => $menuLink['expanded'] === '1' ? TRUE : FALSE,
              'enabled' => $menuLink['enabled'] === '1' ? TRUE : FALSE,
              'parent' => $menuLink['parent'],
              'description' => $menuLink['description'],
              'weight' => $menuLink['weight'],
              'langcode' => $menuLink['langcode'],
              'uuid' => $menuLink['uuid'],
            ])->save();
          }
          else {
            foreach ($entities as $entity) {
              if ($menuLink['uuid'] === $entity->uuid()) {
                $customMenuLink = MenuLinkContent::load($entity->id());
                if (!empty($customMenuLink)) {
                  $customMenuLink
                    ->set('title', $menuLink['title'])
                    ->set('link', [
                      'uri' => $menuLink['uri'],
                      'title' => $menuLink['link_title'],
                    ])
                    ->set('expanded', $menuLink['expanded'] === '1' ? TRUE : FALSE)
                    ->set('enabled', $menuLink['enabled'] === '1' ? TRUE : FALSE)
                    ->set('parent', $menuLink['parent'])
                    ->set('description', $menuLink['description'])
                    ->set('weight', $menuLink['weight'])
                    ->save();
                }

                break;
              }
            }
          }

          $idsDone[] = $menuLink['uuid'];

          if (in_array($menuLink['uuid'], $idsLeft)) {
            unset($idsLeft[$menuLink['uuid']]);
          }

          if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
            drush_log('Imported "' . $menuLink['title'] . '" into ' . $menuLink['menu_name'], 'ok');
          }
          StructureSyncHelper::logMessage('Imported "' . $menuLink['title'] . '" into ' . $menuLink['menu_name']);

          $context['sandbox']['progress']++;
          if ($context['sandbox']['progress'] != $context['sandbox']['max']) {
            $context['finished'] = $context['sandbox']['progress'] / $context['sandbox']['max'];
          }
        }
        else {
          $idsLeft[$menuLink['uuid']] = $menuLink['uuid'];
        }
      }

      $firstRun = FALSE;
    }

    $context['finished'] = 1;
  }

  /**
   * Function to import menu links safe (only adding what isn't already there).
   */
  public static function importMenuLinksSafe($menus, &$context) {
    $menusFiltered = $menus;

    $entities = StructureSyncHelper::getEntityManager()
      ->getStorage('menu_link_content')
      ->loadMultiple();

    foreach ($entities as $entity) {
      for ($i = 0; $i < count($menus); $i++) {
        if ($entity->uuid() === $menus[$i]['uuid']) {
          unset($menusFiltered[$i]);
        }
      }
    }

    foreach ($menusFiltered as $menuLink) {
      MenuLinkContent::create([
        'title' => $menuLink['title'],
        'link' => [
          'uri' => $menuLink['uri'],
          'title' => $menuLink['link_title'],
        ],
        'menu_name' => $menuLink['menu_name'],
        'expanded' => $menuLink['expanded'] === '1' ? TRUE : FALSE,
        'enabled' => $menuLink['enabled'] === '1' ? TRUE : FALSE,
        'parent' => $menuLink['parent'],
        'description' => $menuLink['description'],
        'weight' => $menuLink['weight'],
        'langcode' => $menuLink['langcode'],
        'uuid' => $menuLink['uuid'],
      ])->save();

      if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
        drush_log('Imported "' . $menuLink['title'] . '" into "' . $menuLink['menu_name'] . '" menu', 'ok');
      }
      StructureSyncHelper::logMessage('Imported "' . $menuLink['title'] . '" into "' . $menuLink['menu_name'] . '" menu');
    }
  }

  /**
   * Function to delete all menu links.
   */
  public static function deleteMenuLinks(&$context) {
    $entities = StructureSyncHelper::getEntityManager()
      ->getStorage('menu_link_content')
      ->loadMultiple();
    StructureSyncHelper::getEntityManager()
      ->getStorage('menu_link_content')
      ->delete($entities);

    if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
      drush_log('Deleted all (content) menu links', 'ok');
    }
    StructureSyncHelper::logMessage('Deleted all (content) menu links');
  }

  /**
   * Function to import (create) all menu links that need to be imported.
   */
  public static function importMenuLinksForce($menus, &$context) {
    foreach ($menus as $menuLink) {
      MenuLinkContent::create([
        'title' => $menuLink['title'],
        'link' => [
          'uri' => $menuLink['uri'],
          'title' => $menuLink['link_title'],
        ],
        'menu_name' => $menuLink['menu_name'],
        'expanded' => $menuLink['expanded'] === '1' ? TRUE : FALSE,
        'enabled' => $menuLink['enabled'] === '1' ? TRUE : FALSE,
        'parent' => $menuLink['parent'],
        'description' => $menuLink['description'],
        'weight' => $menuLink['weight'],
        'langcode' => $menuLink['langcode'],
        'uuid' => $menuLink['uuid'],
      ])->save();

      if (array_key_exists('drush', $context) && $context['drush'] === TRUE) {
        drush_log('Imported "' . $menuLink['title'] . '" into "' . $menuLink['menu_name'] . '" menu', 'ok');
      }
      StructureSyncHelper::logMessage('Imported "' . $menuLink['title'] . '" into "' . $menuLink['menu_name'] . '" menu');
    }
  }

  /**
   * Function that signals that the import of menu links has finished.
   */
  public static function menuLinksImportFinishedCallback($success, $results, $operations) {
    StructureSyncHelper::logMessage('Flushing all caches');

    drupal_flush_all_caches();

    StructureSyncHelper::logMessage('Successfully flushed caches');

    StructureSyncHelper::logMessage('Successfully imported menu links');

    drupal_set_message(t('Successfully imported menu links'));
  }

}
