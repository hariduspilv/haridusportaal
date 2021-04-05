<?php

namespace Drupal\sitemap\Plugin\Derivative;

use Drupal\Component\Plugin\Derivative\DeriverBase;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Plugin\Discovery\ContainerDeriverInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * {@inheritdoc}
 */
class MenuSitemapDeriver extends DeriverBase implements ContainerDeriverInterface {

  /**
   * The menu storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $menuStorage;

  /**
   * Constructs new SitemapMenus sitemap_map.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $menu_storage
   *   The menu storage.
   */
  public function __construct(EntityStorageInterface $menu_storage) {
    $this->menuStorage = $menu_storage;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, $base_plugin_id) {
    return new static(
      $container->get('entity_type.manager')->getStorage('menu')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDerivativeDefinitions($base_plugin_definition) {
    foreach ($this->menuStorage->loadMultiple() as $menu => $entity) {
      /* @var $entity \Drupal\system\Entity\Menu */
      $this->derivatives[$menu] = $base_plugin_definition;
      $this->derivatives[$menu]['title'] = t('Menu: @menu', ['@menu' => $entity->label()]);
      $this->derivatives[$menu]['description'] = $entity->getDescription();
      $this->derivatives[$menu]['settings']['title'] = '';
      $this->derivatives[$menu]['menu'] = $entity->id();
      $this->derivatives[$menu]['config_dependencies']['config'] = [$entity->getConfigDependencyName()];
    }
    return $this->derivatives;
  }

}
