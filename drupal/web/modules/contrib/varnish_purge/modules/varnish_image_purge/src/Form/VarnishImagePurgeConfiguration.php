<?php

namespace Drupal\varnish_image_purge\Form;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\ContentEntityType;
use Drupal\Core\Entity\EntityTypeBundleInfo;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Configure site information settings for this site.
 */
class VarnishImagePurgeConfiguration extends ConfigFormBase {

  /**
   * Drupal\Core\Entity\EntityTypeManagerInterface definition.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  private $entityTypeManager;

  /**
   * Drupal\Core\Entity\EntityTypeBundleInfo definition.
   *
   * @var \Drupal\Core\Entity\EntityTypeBundleInfo
   */
  private $entityTypeBundleInfo;

  /**
   * VarnishImagePurgeConfiguration constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   * @param \Drupal\Core\Entity\EntityTypeBundleInfo $entityTypeBundleInfo
   *   The entity type bundle info.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    EntityTypeManagerInterface $entityTypeManager,
    EntityTypeBundleInfo $entityTypeBundleInfo
  ) {
    parent::__construct($config_factory);
    $this->entityTypeManager = $entityTypeManager;
    $this->entityTypeBundleInfo = $entityTypeBundleInfo;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('entity_type.manager'),
      $container->get('entity_type.bundle.info')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'varnish_image_purge_configuration_form';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['varnish_image_purge.configuration'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('varnish_image_purge.configuration');
    $entity_types = $config->get('entity_types');

    $content_entity_types = [];
    $entity_type_definitions = $this->entityTypeManager->getDefinitions();
    /* @var $definition \Drupal\Core\Entity\EntityTypeInterface */
    foreach ($entity_type_definitions as $definition) {
      if ($definition instanceof ContentEntityType) {
        $content_entity_types[] = $definition;
      }
    }

    if (empty($content_entity_types)) {
      drupal_set_message($this->t('No content entities were found'));
      return NULL;
    }

    foreach ($content_entity_types as $content_entity_type) {

      $form['intro'] = [
        '#markup' => t('Configure bundles of entity types that Varnish image purge should be used for, if none selected, all bundles form all entity types will be used. Just the fields of type image will be purge.'),
      ];

      $default_value = [];
      if (!is_null($entity_types) && isset($entity_types[$content_entity_type->id()])) {
        $default_value = $entity_types[$content_entity_type->id()];
      }

      $form['entity_types'][$content_entity_type->id()] = [
        '#type' => 'checkboxes',
        '#title' => $content_entity_type->getLabel(),
        '#multiple' => TRUE,
        '#options' => $this->getOptionsFromEntity($content_entity_type),
        '#default_value' => $default_value,
      ];
    }

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // @todo
    // Validations.
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $config = $this->config('varnish_image_purge.configuration');
    $values = [];
    foreach ($form_state->getValues() as $entity_type => $bundles) {
      if (is_array($bundles)) {
        foreach ($bundles as $bundle_id => $bundle) {
          if ($bundle !== 0) {
            $values[$entity_type][] = $bundle_id;
          }
        }
      }
    }
    $config->set('entity_types', $values);
    $config->save();

    parent::submitForm($form, $form_state);
  }

  /**
   * Get the bundles form an entity and format as options.
   *
   * @param \Drupal\Core\Entity\ContentEntityType $content_entity_type
   *   The entity to get the bundles from.
   *
   * @return array
   *   Fortmatted options.
   */
  private function getOptionsFromEntity(ContentEntityType $content_entity_type) {
    $bundles = $this->entityTypeBundleInfo->getBundleInfo($content_entity_type->id());
    $options = [];
    foreach ($bundles as $key => $bundle) {
      $options[$key] = $bundle['label'];
    }
    return $options;
  }

}
