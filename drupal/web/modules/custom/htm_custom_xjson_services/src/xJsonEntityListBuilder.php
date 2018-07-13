<?php

namespace Drupal\htm_custom_xjson_services;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of xJson entity entities.
 *
 * @ingroup htm_custom_xjson_services
 */
class xJsonEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('xJson entity ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_xjson_services\Entity\xJsonEntity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.x_json_entity.edit_form',
      ['x_json_entity' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
