<?php

namespace Drupal\search_api_autocomplete;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides permissions of the search_api_autocomplete module.
 */
class Permissions implements ContainerInjectionInterface {

  use StringTranslationTrait;

  /**
   * The entity storage service.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface
   */
  protected $storage;

  /**
   * Constructs a Permissions object.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $storage
   *   The entity storage service.
   */
  public function __construct(EntityStorageInterface $storage) {
    $this->storage = $storage;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')->getStorage('search_api_autocomplete_search')
    );
  }

  /**
   * Returns a list of permissions, one per configured search.
   *
   * @return array[]
   *   A list of permission definitions, keyed by permission machine name.
   */
  public function bySearch() {
    $perms = [];
    /** @var \Drupal\search_api_autocomplete\SearchInterface $search */
    foreach ($this->storage->loadMultiple() as $id => $search) {
      $perms['use search_api_autocomplete for ' . $id] = [
        'title' => $this->t('Use autocomplete for the %search search', ['%search' => $search->label()]),
      ];
    }
    return $perms;
  }

}
