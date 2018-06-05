<?php

namespace Drupal\structure_sync\Form;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\structure_sync\StructureSyncHelper;
use Drupal\Core\Config\ConfigFactoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Import and export form for content in structure, like taxonomy terms.
 */
class TaxonomiesSyncForm extends ConfigFormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'structure_sync_taxonomies';
  }

  /**
   * Class constructor.
   */
  public function __construct(ConfigFactoryInterface $config_factory, EntityTypeManagerInterface $entityTypeManager) {
    parent::__construct($config_factory);
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
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
      '#title' => $this->t('Taxonomies'),
    ];

    $form['export'] = [
      '#type' => 'details',
      '#title' => $this->t('Export'),
      '#weight' => 1,
      '#open' => TRUE,
    ];

    $form['export']['export_taxonomies'] = [
      '#type' => 'submit',
      '#value' => $this->t('Export taxonomies'),
      '#name' => 'exportTaxonomies',
      '#button_type' => 'primary',
      '#submit' => [[$helper, 'exportTaxonomies']],
    ];

    // Get a list of all vocabularies (their machine names).
    $vocabulary_list = [];
    $vocabularies = $this->entityTypeManager
      ->getStorage('taxonomy_vocabulary')->loadMultiple();
    foreach ($vocabularies as $vocabulary) {
      $vocabulary_list[$vocabulary->id()] = $vocabulary->label();
    }

    $form['export']['export_voc_list'] = [
      '#type' => 'checkboxes',
      '#options' => $vocabulary_list,
      '#default_value' => array_keys($vocabulary_list),
      '#title' => $this->t('Select the vocabularies you would like to export'),
    ];

    $form['import'] = [
      '#type' => 'details',
      '#title' => $this->t('Import'),
      '#weight' => 2,
      '#open' => TRUE,
    ];

    $taxonomies = $this->config('structure_sync.data')->get('taxonomies');

    if (empty($taxonomies)) {
      $form['import']['import_no_data'] = [
        '#type' => 'markup',
        '#markup' => $this->t("There's no data to import, please do an export first."),
      ];
      return $form;
    }

    $form['import']['import_taxonomies_safe'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import taxonomies (safely)'),
      '#name' => 'importTaxonomiesSafe',
      '#button_type' => 'primary',
      '#submit' => [[$helper, 'importTaxonomiesSafe']],
    ];

    $form['import']['import_taxonomies_full'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import taxonomies (full)'),
      '#name' => 'importTaxonomiesFull',
      '#submit' => [[$helper, 'importTaxonomiesFull']],
    ];

    $form['import']['import_taxonomies_force'] = [
      '#type' => 'submit',
      '#value' => $this->t('Import taxonomies (force)'),
      '#name' => 'importTaxonomiesForce',
      '#submit' => [[$helper, 'importTaxonomiesForce']],
    ];

    $voc_list = array_keys($taxonomies);
    $vocabulary_list_config = array_combine($voc_list, $voc_list);
    foreach ($vocabulary_list_config as $voc) {
      $vocabulary_list_config[$voc] = $vocabulary_list[$voc];

      if (!in_array($vocabulary_list_config[$voc], $vocabulary_list)) {
        drupal_set_message($this->t('Vocabulary "@voc" does not (yet) exist on the site', ['@voc' => $voc]), 'warning');

        unset($vocabulary_list_config[$voc]);
      }
    }

    $form['import']['import_voc_list'] = [
      '#type' => 'checkboxes',
      '#options' => $vocabulary_list_config,
      '#default_value' => array_keys($vocabulary_list_config),
      '#title' => $this->t('Select the vocabularies you would like to import'),
    ];

    return $form;
  }

}
