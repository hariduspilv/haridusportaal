<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Defines a class to build a listing of Oska entity entities.
 *
 * @ingroup htm_custom_oska
 */
class OskaEntityListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['name'] = $this->t('File name');
    $header['file'] = $this->t('File');
//    $header['action'] = $this->t('Delete');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_oska\Entity\OskaEntity */
//dump($entity);
      $row['name'] = $entity->label();
      $row['file'] = $entity->id();
//      $row['action'] = Link::createFromRoute(
//        'Kustuta',
//        'entity.oska_entity.delete_form',
//        ['oska_entity' => $entity->id()]
//      );

    return $row + parent::buildRow($entity);
  }

}
