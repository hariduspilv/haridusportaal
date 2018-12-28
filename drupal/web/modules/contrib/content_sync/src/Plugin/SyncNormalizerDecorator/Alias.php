<?php

namespace Drupal\content_sync\Plugin\SyncNormalizerDecorator;


use Drupal\content_sync\Plugin\SyncNormalizerDecoratorBase;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Path\AliasManager;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a decorator for setting the alias to entity.
 *
 * @SyncNormalizerDecorator(
 *   id = "alias",
 *   name = @Translation("Alias"),
 * )
 */
class Alias extends SyncNormalizerDecoratorBase implements ContainerFactoryPluginInterface {

  /**
   * @var \Drupal\Core\Path\AliasManager
   */
  protected $aliasManager;

  public function __construct(array $configuration, $plugin_id, $plugin_definition, AliasManager $alias_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->aliasManager = $alias_manager;
  }

  /**
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   * @param array $configuration
   * @param $plugin_id
   * @param $plugin_definition
   *
   * @return static
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('path.alias_manager')
    );
  }

  /**
   * @param array $normalized_entity
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   * @param $format
   * @param array $context
   */
  public function decorateNormalization(array &$normalized_entity, ContentEntityInterface $entity, $format, array $context = []) {
    if ($entity->hasLinkTemplate('canonical')) {
      $url = $entity->toUrl();
      if (!empty($url)) {
        $system_path = '/' . $url->getInternalPath();
        $langcode = $entity->language()->getId();
        $path_alias = $this->aliasManager->getAliasByPath($system_path, $langcode);
        if (!empty($path_alias) && $path_alias != $system_path) {
          $normalized_entity['path'] = [
            [
              'alias' => $path_alias
            ],
          ];
        }
      }
    }
  }

}