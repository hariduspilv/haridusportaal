<?php

namespace Drupal\structure_sync\Form;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\structure_sync\StructureSyncHelper;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Import and export form for content in structure, like taxonomy terms.
 */
class BlocksSyncForm extends ConfigFormBase {

  /**
   * The database.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $database;

  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'structure_sync_blocks';
  }

  /**
   * Class constructor.
   */
  public function __construct(ConfigFactoryInterface $config_factory, Connection $database, EntityTypeManagerInterface $entityManager) {
    parent::__construct($config_factory);
    $this->database = $database;
    $this->entityTypeManager = $entityManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('database'),
      $container->get('entity_type.manager')
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
      '#title' => $this->t('Custom blocks'),
    ];

    $form['export'] = [
      '#type' => 'details',
      '#title' => $this->t('Export'),
      '#weight' => 1,
      '#open' => TRUE,
    ];

    $form['export']['blocks'] = [
      '#type' => 'submit',
      '#value' => $this->t('Export custom blocks'),
      '#name' => 'exportBlocks',
      '#button_type' => 'primary',
      '#submit' => [[$helper, 'exportCustomBlocks']],
    ];

    $blockList = [];
    $blocks = $this->entityTypeManager->getStorage('block_content')
      ->loadMultiple();
    foreach ($blocks as $block) {
      $blockList[$block->uuid()] = $block->info->getValue()[0]['value'];
    }

    $form['export']['export_block_list'] = [
      '#type' => 'checkboxes',
      '#options' => $blockList,
      '#default_value' => array_keys($blockList),
      '#title' => $this->t('Select the custom blocks you would like to export'),
    ];

    $form['import'] = [
      '#type' => 'details',
      '#title' => $this->t('Import'),
      '#weight' => 2,
      '#open' => TRUE,
    ];

    $block_list = $this->config('structure_sync.data')->get('blocks');

    if (empty($block_list)) {
      $form['import']['import_no_data'] = [
        '#type' => 'markup',
        '#markup' => $this->t("There's no data to import, please do an export first."),
      ];
      return $form;
    }

    $form['import']['import_blocks_safe'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import custom blocks (safely)'),
      '#name' => 'importBlocksSafe',
      '#button_type' => 'primary',
      '#submit' => [[$helper, 'importCustomBlocksSafe']],
    ];

    $form['import']['import_blocks_full'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import custom blocks (full)'),
      '#name' => 'importBlocksFull',
      '#submit' => [[$helper, 'importCustomBlocksFull']],
    ];

    $form['import']['import_blocks_force'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import custom blocks (force)'),
      '#name' => 'importBlocksForce',
      '#submit' => [[$helper, 'importCustomBlocksForce']],
    ];

    $block_list_config = [];

    foreach ($block_list as $block) {
      if ($block['revision_id'] === $block['rev_id_current']) {
        $block_list_config[$block['uuid']] = $block['info'];
      }
    }

    $form['import']['import_block_list'] = [
      '#type' => 'checkboxes',
      '#options' => $block_list_config,
      '#default_value' => array_keys($block_list_config),
      '#title' => $this->t('Select the custom blocks you would like to import'),
    ];

    return $form;
  }

}
