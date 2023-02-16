<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\InternalUrl;

use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use Drupal\schema_metatag\SchemaMetatagManager;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @GraphQLField(
 *   secure = true,
 *   id = "url_metatags_schema",
 *   name = "metatags_schema",
 *   type = "String",
 *   description = @Translation("Loads metatags schema for the URL."),
 *   parents = {"InternalUrl", "EntityCanonicalUrl"}
 * )
 */
class MetatagsSchema extends FieldPluginBase implements ContainerFactoryPluginInterface {

  use DependencySerializationTrait;

  /**
   * Module Handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  private $moduleHandler;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
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
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   Module Handler.
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    $pluginDefinition,
    ModuleHandlerInterface $moduleHandler
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * {@inheritdoc}
   * @throws \JsonException
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if ($value instanceof Url && $this->isModuleSchemaActive()) {
      $tags = metatag_get_tags_from_route();

      // Trigger hook_metatags_attachments_alter().
      // Allow modules to rendered metatags prior to attaching.
      $this->moduleHandler->alter('metatags_attachments', $tags);

      $jsonLd = SchemaMetatagManager::parseJsonld($tags['#attached']['html_head']);
      yield json_encode($jsonLd, JSON_THROW_ON_ERROR);
    }
    else {
      yield t('The module ' . SCHEMA_METATAG_MODULE_NAME . ' is not installed.');
    }
  }

  /**
   * Chec if module SCHEMA_METATAG_MODULE_NAME is active.
   *
   * @return bool
   */
  private function isModuleSchemaActive(): bool {
    return $this->moduleHandler->moduleExists(SCHEMA_METATAG_MODULE_NAME);
  }

}
