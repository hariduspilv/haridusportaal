<?php

namespace Drupal\content_sync\Form;

use Drupal\content_sync\Exporter\ContentExporterInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityTypeBundleInfo;
use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Entity\ContentEntityType;
use Symfony\Component\DependencyInjection\ContainerInterface;



/**
 * Provides a form for exporting a single content file.
 */
class ContentSingleExportForm extends FormBase {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The entity bundle manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeBundleInfo
   */
  protected $entityBundleManager;

  /**
   * @var \Drupal\content_sync\Exporter\ContentExporterInterface
   */
  protected $contentExporter;

  /**
   * Constructs a new ContentSingleExportForm.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *
   * @param \Drupal\Core\Entity\EntityTypeBundleInfo $entity_bundle_manager
   *
   * @param \Drupal\content_sync\Exporter\ContentExporterInterface $content_exporter
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, EntityTypeBundleInfo $entity_bundle_manager, ContentExporterInterface $content_exporter) {
    $this->entityTypeManager = $entity_type_manager;
    $this->entityBundleManager = $entity_bundle_manager;
    $this->contentExporter = $content_exporter;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager'),
      $container->get('entity_type.bundle.info'),
      $container->get('content_sync.exporter')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'config_single_export_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $content_type = 'node', $content_name = NULL, $content_entity = NULL) {
    $entity_types = [];
    $entity_type_definitions = $this->entityTypeManager->getDefinitions();
    foreach ($entity_type_definitions as $entity_type => $definition) {
      if ($definition instanceof ContentEntityType) {
        $entity_types[$entity_type] = $definition->getLabel();
      }
    }

    uasort($entity_types, 'strnatcasecmp');
    $content_types = $entity_types;
    $form['content_type'] = [
      '#title' => $this->t('Content type'),
      '#type' => 'select',
      '#options' => $content_types,
      '#default_value' => $content_type,
      '#attributes' => array('onchange' => 'this.form.content_name.value = null; if(this.form.content_entity){ this.form.content_entity.value = null; } this.form.export.value = null; this.form.submit();'),
    ];

    $default_type = $form_state->getValue('content_type', $content_type);
    $default_name = $form_state->getValue('content_name', $content_name);
    $form['content_name'] = [
      '#title' => $this->t('Content name'),
      '#type' => 'select',
      '#options' => $this->findContent($default_type),
      '#default_value' => $content_name,
      '#attributes' => array('onchange' => 'if(this.form.content_entity){ this.form.content_entity.value = null; } this.form.export.value = null; this.form.submit();'),
    ];

    // Auto-complete field for the content entity
    if($default_type && $default_name){
      $form['content_entity'] = [
        '#title' => $this->t('Content Entity'),
        '#type' => 'entity_autocomplete',
        '#target_type' => $default_type,
        '#selection_handler' => 'default',
        '#selection_settings' => [
          'target_bundles' => [$default_name],
        ],
        '#ajax' => [
          'callback' => '::updateExport',
          'wrapper' => 'edit-export-wrapper',
            'event' => 'autocompleteclose',
        ],
      ];
      // Remove target bundles for user & file because it is not supported.
      if($default_type == 'user' || $default_type == 'file'){
        unset($form['content_entity']['#selection_settings']);
      }
    }

    $form['export'] = [
      '#title' => $this->t('Here is your configuration:'),
      '#type' => 'textarea',
      '#rows' => 24,
      '#prefix' => '<div id="edit-export-wrapper">',
      '#suffix' => '</div>',
    ];

    return $form;
  }

  /**
   * Handles switching the content type selector.
   */
  protected function findContent($content_type) {
    $names = [
      '' => $this->t('- Select -'),
    ];
    // For a given entity type, load all entities.
    if ($content_type) {
      $entity_storage = $this->entityBundleManager->getBundleInfo($content_type);
      foreach ($entity_storage as $entityKey => $entity) {
        $entity_id = $entityKey;
        if ($label = $entity['label']) {
          $names[$entity_id] = new TranslatableMarkup('@label (@id)', ['@label' => $label, '@id' => $entity_id]);
        }
        else {
          $names[$entity_id] = $entity_id;
        }
      }
    }
    return $names;
  }

  /**
   * Handles switching the export textarea.
   */
  public function updateExport($form, FormStateInterface $form_state) {
    // Get submitted values
    $entity_type = $form_state->getValue('content_type');
    $entity_id = $form_state->getValue('content_entity');

    // DB entity to YAML
    $entity = $this->entityTypeManager->getStorage($entity_type)->load($entity_id);

    // Generate the YAML file.
    $serializer_context = [];
    $language = \Drupal::languageManager()->getCurrentLanguage()->getId();
    $entity = $entity->getTranslation($language);
    $exported_entity = $this->contentExporter->exportEntity($entity, $serializer_context);

    // Create the name
    $name = $entity_type . "." . $entity->bundle() . "." . $entity->uuid();

    // Return form values
    $form['export']['#value'] = $exported_entity;
    $form['export']['#description'] = $this->t('Filename: %name', ['%name' => $name . '.yml']);
    return $form['export'];
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Nothing to submit.
  }

}
