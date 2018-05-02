<?php

namespace Drupal\conditional_fields\Controller;

use Drupal\conditional_fields\Form\ConditionalFieldFormTab;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\ContentEntityType;
use Drupal\Core\Entity\ContentEntityTypeInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeBundleInfoInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Url;

/**
 * Returns responses for conditional_fields module routes.
 */
class ConditionalFieldController extends ControllerBase {

  protected $entityTypeManager;

  /**
   * Form Builder.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * Entity type bundle info.
   *
   * @var \Drupal\Core\Entity\EntityTypeBundleInfoInterface
   */
  protected $entityTypeBundleInfo;

  /**
   * Entity field manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * ConditionalFieldController constructor.
   *
   * @param EntityTypeManagerInterface $entityTypeManager
   *   Entity type manager.
   * @param FormBuilderInterface $formBuilder
   *   Form builder.
   * @param EntityTypeBundleInfoInterface $entityTypeBundleInfo
   *   Entity type bundle info.
   * @param EntityFieldManagerInterface $entityFieldManager
   *   Entity field manager.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager, FormBuilderInterface $formBuilder, EntityTypeBundleInfoInterface $entityTypeBundleInfo, EntityFieldManagerInterface $entityFieldManager) {
    $this->entityTypeManager = $entityTypeManager;
    $this->formBuilder = $formBuilder;
    $this->entityTypeBundleInfo = $entityTypeBundleInfo;
    $this->entityFieldManager = $entityFieldManager;
  }

  /**
   * Show entity types.
   *
   * @return array
   *   Array of page elements to render.
   */
  public function entityTypeList() {
    $output = [
      '#theme' => 'admin_block_content',
      '#content' => [],
    ];

    foreach ($this->getEntityTypes() as $key => $entityType) {
      $output['#content'][] = [
        'url' => Url::fromRoute('conditional_fields.bundle_list', ['entity_type' => $key]),
        'title' => $entityType->getLabel(),
      ];
    }

    return $output;
  }

  /**
   * Title for fields form.
   *
   * @param string $entity_type
   *   Entity type.
   * @param string $bundle
   *   Entity bundle.
   *
   * @return string
   *   Page title.
   */
  public function formTitle($entity_type, $bundle) {
    $bundles = $this->entityTypeBundleInfo->getBundleInfo($entity_type);
    if (!isset($bundles[$bundle]['label'])) {
      return '';
    }
    return $bundles[$bundle]['label'];
  }

  /**
   * Title for field settings form.
   *
   * @param string $entity_type
   *   Entity type.
   * @param string $bundle
   *   Entity bundle.
   * @param string $field_name
   *   Field name.
   *
   * @return string
   *   Page title.
   */
  public function editFormTitle($entity_type, $bundle, $field_name) {
    $instances = $this->entityFieldManager->getFieldDefinitions($entity_type, $bundle);
    if (!isset($instances[$field_name])) {
      return '';
    }
    $field_instance = $instances[$field_name];
    return $field_instance->getLabel();
  }

  /**
   * Title for bundle list of current entity type.
   *
   * @param string $entity_type
   *   Entity type.
   *
   * @return string The title for the bundle list page.
   *   The title for the bundle list page.
   */
  public function bundleListTitle($entity_type) {
    $type = $this->entityTypeManager->getDefinition($entity_type);
    return $type->getLabel();
  }

  /**
   * Show bundle list of current entity type.
   *
   * @param string $entity_type
   *   Entity type.
   *
   * @return array Array of page elements to render.
   *   Array of page elements to render.
   */
  public function bundleList($entity_type) {
    $output = [];
    $bundles = $this->entityTypeBundleInfo->getBundleInfo($entity_type);
    if ($bundles) {
      $output['#theme'] = 'admin_block_content';
      foreach ($bundles as $bundle_key => $bundle) {
        $output['#content'][] = [
          'url' => Url::fromRoute('conditional_fields.conditions_list', [
            'entity_type' => $entity_type,
            'bundle' => $bundle_key,
          ]),
          'title' => $bundle['label'],
        ];
      }
    }
    else {
      $output['#type'] = 'markup';
      $output['#markup'] = $this->t("Bundles not found");
    }

    return $output;
  }

  /**
   * Get list of available EntityTypes.
   *
   * @return ContentEntityTypeInterface[]
   *   List of content entity types.
   */
  public function getEntityTypes() {
    $entityTypes = [];

    foreach ($this->entityTypeManager->getDefinitions() as $key => $entityType) {
      if ($entityType instanceof ContentEntityType) {
        $entityTypes[$key] = $entityType;
      }
    }

    return $entityTypes;
  }

  /**
   * Provide arguments for ConditionalFieldFormTab.
   *
   * @param string $node_type
   *   Node type.
   *
   * @return array
   *   Form array.
   */
  public function provideArguments($node_type) {
    return $this->formBuilder->getForm(ConditionalFieldFormTab::class, 'node', $node_type);
  }

}
