<?php

namespace Drupal\htm_custom_contribution_projects;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Contribution project entities.
 *
 * @ingroup htm_custom_contribution_projects
 */
class ContributionProjectEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Contribution project ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_contribution_projects\Entity\ContributionProjectEntity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.contribution_project_entity.edit_form',
      ['contribution_project_entity' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
