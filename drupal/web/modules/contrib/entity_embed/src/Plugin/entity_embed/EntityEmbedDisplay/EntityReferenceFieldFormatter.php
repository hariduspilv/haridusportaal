<?php

namespace Drupal\entity_embed\Plugin\entity_embed\EntityEmbedDisplay;

use Drupal\Core\Access\AccessResult;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\FormatterPluginManager;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\TypedData\TypedDataManager;
use Drupal\entity_embed\EntityEmbedDisplay\FieldFormatterEntityEmbedDisplayBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Entity Embed Display reusing entity reference field formatters.
 *
 * @see \Drupal\entity_embed\EntityEmbedDisplay\EntityEmbedDisplayInterface
 *
 * @EntityEmbedDisplay(
 *   id = "entity_reference",
 *   label = @Translation("Entity Reference"),
 *   deriver = "Drupal\entity_embed\Plugin\Derivative\FieldFormatterDeriver",
 *   field_type = "entity_reference",
 *   supports_image_alt_and_title = TRUE
 * )
 */
class EntityReferenceFieldFormatter extends FieldFormatterEntityEmbedDisplayBase {

  /**
   * The configuration factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * Constructs a new EntityReferenceFieldFormatter.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Field\FormatterPluginManager $formatter_plugin_manager
   *   The field formatter plugin manager.
   * @param \Drupal\Core\TypedData\TypedDataManager $typed_data_manager
   *   The typed data manager.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Drupal\Core\Config\ConfigFactoryInterface|null $config_factory
   *   The configuration factory, or null to get from global container for
   *   backwards compatibility.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, EntityTypeManagerInterface $entity_type_manager, FormatterPluginManager $formatter_plugin_manager, TypedDataManager $typed_data_manager, LanguageManagerInterface $language_manager, ConfigFactoryInterface $config_factory = NULL) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $entity_type_manager, $formatter_plugin_manager, $typed_data_manager, $language_manager);
    $this->configFactory = $config_factory instanceof ConfigFactoryInterface ? $config_factory : \Drupal::configFactory();
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('entity_type.manager'),
      $container->get('plugin.manager.field.formatter'),
      $container->get('typed_data_manager'),
      $container->get('language_manager'),
      $container->get('config.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldDefinition() {
    if (!isset($this->fieldDefinition)) {
      $this->fieldDefinition = parent::getFieldDefinition();
      $this->fieldDefinition->setSetting('target_type', $this->getEntityTypeFromContext());
    }
    return $this->fieldDefinition;
  }

  /**
   * {@inheritdoc}
   */
  public function getFieldValue() {
    return ['target_id' => $this->getContextValue('entity')->id()];
  }

  /**
   * {@inheritdoc}
   */
  protected function isApplicableFieldFormatter() {
    $access = parent::isApplicableFieldFormatter();

    // Don't bother checking if not allowed.
    if ($access->isAllowed()) {
      if ($this->getPluginId() === 'entity_reference:entity_reference_entity_view') {
        // This option disables entity_reference_entity_view plugin for content
        // entity types. If it is truthy then the plugin is enabled for all
        // entity types.
        $mode = $this->configFactory->get('entity_embed.settings')->get('rendered_entity_mode');
        if ($mode) {
          // Return *allowed* object.
          return $access;
        }

        // Only allow this if this is not a content entity type.
        $entity_type_id = $this->getEntityTypeFromContext();
        if ($entity_type_id) {
          $definition = $this->entityTypeManager->getDefinition($entity_type_id);
          return $access->andIf(AccessResult::allowedIf(!$definition->entityClassImplements(ContentEntityInterface::class)));
        }
      }
    }

    return $access;
  }

}
