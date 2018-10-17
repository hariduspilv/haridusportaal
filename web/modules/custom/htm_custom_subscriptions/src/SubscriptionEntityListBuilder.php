<?php

namespace Drupal\htm_custom_subscriptions;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;

/**
 * Defines a class to build a listing of Subscription entity entities.
 *
 * @ingroup htm_custom_subscriptions
 */
class SubscriptionEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Subscription entity ID');
    $header['name'] = $this->t('Name');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_subscriptions\Entity\SubscriptionEntity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.subscription_entity.edit_form',
      ['subscription_entity' => $entity->id()]
    );
    return $row + parent::buildRow($entity);
  }

}
