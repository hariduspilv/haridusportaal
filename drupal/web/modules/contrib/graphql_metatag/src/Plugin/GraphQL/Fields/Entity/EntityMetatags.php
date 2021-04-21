<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\Entity;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\metatag\MetatagManagerInterface;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @GraphQLField(
 *   secure = true,
 *   id = "entity_metatags",
 *   name = "entityMetatags",
 *   type = "[Metatag]",
 *   description = @Translation("Loads metatags for the entity."),
 *   parents = {"Entity"}
 * )
 */
class EntityMetatags extends FieldPluginBase implements ContainerFactoryPluginInterface {

  use DependencySerializationTrait;

  /**
   * The metatag manager service.
   *
   * @var \Drupal\metatag\MetatagManagerInterface
   */
  protected $metatagManager;

  /**
   * Module Handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $container->get('metatag.manager'),
      $container->get('module_handler')
    );
  }

  /**
   * Metatags constructor.
   *
   * @param array $configuration
   *   The plugin configuration array.
   * @param string $pluginId
   *   The plugin id.
   * @param mixed $pluginDefinition
   *   The plugin definition array.
   * @param \Drupal\metatag\MetatagManagerInterface $metatagManager
   *   Metatag Manager.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   Module Handler.
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    $pluginDefinition,
    MetatagManagerInterface $metatagManager,
    ModuleHandlerInterface $moduleHandler
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->metatagManager = $metatagManager;
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * {@inheritdoc}
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if ($value instanceof ContentEntityInterface) {
      $tags = $this->metatagManager->tagsFromEntityWithDefaults($value);

      // Trigger hook_metatags_attachments_alter().
      // Allow modules to rendered metatags prior to attaching.
      $this->moduleHandler->alter('metatags_attachments', $tags);

      // Filter non schema metatags, because schema metatags are processed in
      // EntitySchemaMetatags class.
      $elements = $this->metatagManager->generateRawElements($tags, $value);
      $elements = array_filter($elements, function ($metatag_object) {
        return !NestedArray::getValue($metatag_object, [
          '#attributes',
          SCHEMA_METATAG_MODULE_NAME,
        ]);
      });

      foreach ($elements as $element) {
        yield $element;
      }
    }
  }

}
