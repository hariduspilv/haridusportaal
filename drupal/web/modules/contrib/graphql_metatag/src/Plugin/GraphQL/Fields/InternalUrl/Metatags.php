<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\InternalUrl;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\graphql\GraphQL\Buffers\SubRequestBuffer;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @GraphQLField(
 *   secure = true,
 *   id = "url_metatags",
 *   name = "metatags",
 *   type = "[Metatag]",
 *   description = @Translation("Loads metatags for the URL."),
 *   parents = {"InternalUrl", "EntityCanonicalUrl"}
 * )
 */
class Metatags extends FieldPluginBase implements ContainerFactoryPluginInterface {

  use DependencySerializationTrait;

  /**
   * The sub-request buffer service.
   *
   * @var \Drupal\graphql\GraphQL\Buffers\SubRequestBuffer
   */
  protected $subRequestBuffer;

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
      $container->get('graphql.buffer.subrequest'),
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
   * @param \Drupal\graphql\GraphQL\Buffers\SubRequestBuffer $subRequestBuffer
   *   The sub-request buffer service.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $moduleHandler
   *   Module Handler.
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    $pluginDefinition,
    SubRequestBuffer $subRequestBuffer,
    ModuleHandlerInterface $moduleHandler
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->subRequestBuffer = $subRequestBuffer;
    $this->moduleHandler = $moduleHandler;
  }

  /**
   * {@inheritdoc}
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if ($value instanceof Url) {
      $resolve = $this->subRequestBuffer->add($value, function () {
        $tags = metatag_get_tags_from_route();

        // Trigger hook_metatags_attachments_alter().
        // Allow modules to rendered metatags prior to attaching.
        $this->moduleHandler->alter('metatags_attachments', $tags);

        $tags = NestedArray::getValue($tags, ['#attached', 'html_head']) ?: [];
        $tags = array_filter($tags, function ($tag) {
          return is_array($tag) &&
            !NestedArray::getValue($tag, [0, '#attributes', SCHEMA_METATAG_MODULE_NAME]);
        });

        return array_map('reset', $tags);
      });

      return function ($value, array $args, ResolveContext $context, ResolveInfo $info) use ($resolve) {
        $tags = $resolve();
        foreach ($tags->getValue() as $tag) {
          yield $tag;
        }
      };
    }
  }

}
