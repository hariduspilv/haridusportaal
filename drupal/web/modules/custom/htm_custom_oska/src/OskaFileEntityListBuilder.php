<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\Core\Url;

/**
 * Defines a class to build a listing of Oska file entity entities.
 *
 * @ingroup htm_custom_oska
 */
class OskaFileEntityListBuilder extends EntityListBuilder {

  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['name'] = $this->t('File name');
//    $header['file'] = $this->t('File');
//    $header['action'] = $this->t('Delete');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   *
   */
  public function buildRow(EntityInterface $file_entity) {
    /**@var OskaFileEntity $file_entity*/
      //dump($file_entity);
      //die();
      $row['name'] = $file_entity->getFileId();
//      $row['file'] = $file_entity->label();
      $row['action'] = Link::createFromRoute(
        'Kustuta',
        'entity.oska_entity.delete_form',
        ['oska_entity' => $file_entity->id()]
      );

    return $row + parent::buildRow($file_entity);
  }

}
