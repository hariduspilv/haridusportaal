<?php

namespace Drupal\htm_custom_graphql\Plugin\GraphQL\DataProducer;

use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\FieldableEntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\graphql\Plugin\GraphQL\DataProducer\DataProducerPluginBase;

/**
 * Produces a field instance from an entity.
 *
 * Can be used instead of the property path when information about the field
 * item must be queryable. The property_path resolver always returns an array
 * which sometimes causes information loss.
 *
 * @DataProducer(
 *   id = "field_text",
 *   name = @Translation("Field Text"),
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
class FieldText extends DataProducerPluginBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   *
   * @codeCoverageIgnore
   */
  public static function create(ContainerInterface $container, array $configuration, $pluginId, $pluginDefinition): self {
    return new static(
      $configuration,
      $pluginId,
      $pluginDefinition
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
   */
  public function __construct(
    array $configuration,
    string $pluginId,
    $pluginDefinition
  ) {
    parent::__construct($configuration, $pluginId, $pluginDefinition);
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

    return [
      'format' => $value->format,
      'value' => $value->value,
      'processed' => $value->processed,
    ];
  }

}
