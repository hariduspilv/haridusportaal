<?php

namespace Drupal\htm_custom_subsidy_projects;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Subsidy project entities.
 *
 * @ingroup htm_custom_subsidy_projects
 */
class SubsidyProjectEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Subsidy project ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_subsidy_projects\Entity\SubsidyProjectEntity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.subsidy_project_entity.edit_form',
      ['subsidy_project_entity' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
