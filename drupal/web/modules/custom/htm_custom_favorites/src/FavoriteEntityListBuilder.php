<?php

namespace Drupal\htm_custom_favorites;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Favorite entity entities.
 *
 * @ingroup htm_custom_favorites
 */
class FavoriteEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Favorite entity ID');
    /*$header['name'] = $this->t('Name');*/
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_favorites\Entity\FavoriteEntity */
    $row['id'] = $entity->id();
    /*$row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.favorite_entity.edit_form',
      ['favorite_entity' => $entity->id()]
    );*/
    return $row + parent::buildRow($entity);
  }

}
