<?php

namespace Drupal\htm_custom_graphql\Plugin\GraphQL\DataProducer\Field;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Render\RenderContext;
use Drupal\Core\Render\RendererInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;
use Drupal\Core\Url;

/**
 * Produces a field instance from an entity.
 *
 * Can be used instead of the property path when information about the field
 * item must be queryable. The property_path resolver always returns an array
 * which sometimes causes information loss.
 *
 * @DataProducer(
 *   id = "field_link",
 *   name = @Translation("Field Link"),
 *   description = @Translation("Selects a field from an entity."),
 *   produces = @ContextDefinition("mixed",
 *     label = @Translation("Field")
 *   ),
 *   consumes = {
 *     "entity" = @ContextDefinition("entity",
 *       label = @Translation("Parent entity")
 *     ),
 *     "field" = @ContextDefinition("string",
 *       label = @Translation("Field name")
 *     )
 *   }
 * )
 */
class LinkProducer extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * The rendering service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition): self {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition,
      $container->get('renderer')
    );
  }

  /**
   * EntityLinks constructor.
   *
   * @param array $configuration
   *   The plugin configuration array.
   * @param string $pluginId
   *   The plugin id.
   * @param mixed $pluginDefinition
   *   The plugin definition.
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer service.
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    $pluginDefinition,
    RendererInterface $renderer
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
    $this->renderer = $renderer;
  }

  /**
   * Finds the requested field on the entity.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity that contains the field.
   * @param string $field
   *   The name of the field to return.
   *
   * @return \Drupal\Core\Field\FieldItemListInterface|null
   *   A field item list if the field exists or null if the entity is not
   *   fieldable or doesn't have the requested field.
   */
  public function resolve(EntityInterface $entity, string $field) {
    if (!$entity instanceof FieldableEntityInterface || !$entity->hasField($field)) {
      return NULL;
    }

    $value = $entity->get($field);

    if (!$value) {
      return NULL;
    }

    if (!$value->first()) {
      return NULL;
    }

    $context = new RenderContext();
    $result = $this->renderer->executeInRenderContext($context, function () use ($value): array {
      return [
        'uri' => $value->uri,
        'link' => $value->uri ? Url::fromUri($value->uri)->toString() : NULL,
        'title' => $value->title
      ];
    });

    return $result;
  }

}
