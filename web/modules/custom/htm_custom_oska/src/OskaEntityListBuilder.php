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
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_oska\Entity\OskaEntity */
      $row['name'] = $entity->label();
      $row['file'] = $entity->id();

    return $row + parent::buildRow($entity);
  }

}
