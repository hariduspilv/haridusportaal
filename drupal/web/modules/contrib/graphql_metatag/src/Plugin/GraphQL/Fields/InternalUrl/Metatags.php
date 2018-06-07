<?php

namespace Drupal\graphql_metatag\Plugin\GraphQL\Fields\InternalUrl;

use Drupal\Component\Utility\NestedArray;
use Drupal\Core\DependencyInjection\DependencySerializationTrait;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Drupal\graphql\GraphQL\Buffers\SubRequestBuffer;
use Drupal\graphql\GraphQL\Execution\ResolveContext;
use Drupal\graphql\Plugin\GraphQL\Fields\FieldPluginBase;
use GraphQL\Type\Definition\ResolveInfo;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * @GraphQLField(
 *   id = "url_metatags",
 *   name = "metatags",
 *   type = "[Metatag]",
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
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition) {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $container->get('graphql.buffer.subrequest')
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
   */
  public function __construct(
    array $configuration,
    $pluginId,
    $pluginDefinition,
    SubRequestBuffer $subRequestBuffer
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->subRequestBuffer = $subRequestBuffer;
  }

  /**
   * {@inheritdoc}
   */
  protected function resolveValues($value, array $args, ResolveContext $context, ResolveInfo $info) {
    if ($value instanceof Url) {
      $resolve = $this->subRequestBuffer->add($value, function () {
        $tags = metatag_get_tags_from_route();
        $tags = NestedArray::getValue($tags, ['#attached', 'html_head']) ?: [];
        $tags = array_filter($tags, function($tag) {
          return is_array($tag) && in_array(NestedArray::getValue($tag, [0, '#tag']), ['meta', 'link']);
        });

        return array_map('reset', $tags);
      });

      return function ($value, array $args, ResolveContext $context, ResolveInfo $info) use ($resolve) {
        $tags = $resolve();
        foreach ($tags as $tag) {
          yield $tag;
        }
      };
    }
  }

}
