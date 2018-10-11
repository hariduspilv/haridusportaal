<?php

namespace Drupal\htm_custom_oska;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Oska indicator entity entities.
 *
 * @ingroup htm_custom_oska
 */
class OskaIndicatorEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Oska indicator entity ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_oska\Entity\OskaIndicatorEntity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.oska_indicator_entity.edit_form',
      ['oska_indicator_entity' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
