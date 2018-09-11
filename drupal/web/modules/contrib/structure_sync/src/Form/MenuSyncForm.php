<?php

namespace Drupal\structure_sync\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\structure_sync\StructureSyncHelper;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Database\Connection;

/**
 * Import and export form for content in structure, like taxonomy terms.
 */
class MenuSyncForm extends ConfigFormBase {

  /**
   * The database.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'structure_sync_menus';
  }

  /**
   * Class constructor.
   */
  public function __construct(ConfigFactoryInterface $config_factory, Connection $database) {
    parent::__construct($config_factory);
    $this->database = $database;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('database')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'structure_sync.data',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $helper = new StructureSyncHelper();

    $form['title'] = [
      '#type' => 'page_title',
      '#title' => $this->t('Menu links'),
    ];

    $form['export'] = [
      '#type' => 'details',
      '#title' => $this->t('Export'),
      '#weight' => 1,
      '#open' => TRUE,
    ];

    $form['export']['export_menu_links'] = [
      '#type' => 'submit',
      '#value' => $this->t('Export menu links'),
      '#name' => 'exportMenuLinks',
      '#button_type' => 'primary',
      '#submit' => [[$helper, 'exportMenuLinks']],
    ];

    $menuList = [];
    $entities = StructureSyncHelper::getEntityManager()
      ->getStorage('menu_link_content')
      ->loadMultiple();
    foreach ($entities as $entity) {
      $menuId = $entity->menu_name->getValue()[0]['value'];
      $menuName = $this->config('system.menu.' . $menuId)->get('label');
      $menuList[$menuId] = $menuName;
    }

    $form['export']['export_menu_list'] = [
      '#type' => 'checkboxes',
      '#options' => $menuList,
      '#default_value' => array_keys($menuList),
      '#title' => $this->t('Select the menus you would like to export'),
    ];

    $form['import'] = [
      '#type' => 'details',
      '#title' => $this->t('Import'),
      '#weight' => 2,
      '#open' => TRUE,
    ];

    $menus = $this->config('structure_sync.data')->get('menus');

    if (empty($menus)) {
      $form['import']['import_no_data'] = [
        '#type' => 'markup',
        '#markup' => $this->t("There's no data to import, please do an export first."),
      ];
      return $form;
    }

    $form['import']['import_menus_safe'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import menu links (safely)'),
      '#name' => 'importMenusSafe',
      '#button_type' => 'primary',
      '#submit' => [[$helper, 'importMenuLinksSafe']],
    ];

    $form['import']['import_menus_full'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import menu links (full)'),
      '#name' => 'importMenusFull',
      '#submit' => [[$helper, 'importMenuLinksFull']],
    ];

    $form['import']['import_menus_force'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import menu links (force)'),
      '#name' => 'importMenusForce',
      '#submit' => [[$helper, 'importMenuLinksForce']],
    ];

    $menu_list = [];
    foreach ($menus as $menu) {
      $menuName = $this->config('system.menu.' . $menu['menu_name'])
        ->get('label');
      $menu_list[$menu['menu_name']] = $menuName;
    }

    $form['import']['import_menu_list'] = [
      '#type' => 'checkboxes',
      '#options' => $menu_list,
      '#default_value' => array_keys($menu_list),
      '#title' => $this->t('Select the menus you would like to import'),
    ];

    return $form;
  }

}
