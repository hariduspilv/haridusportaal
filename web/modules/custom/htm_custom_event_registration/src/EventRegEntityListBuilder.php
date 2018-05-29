<?php

namespace Drupal\htm_custom_event_registration;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityListBuilder;
use Drupal\Core\Link;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Url;

/**
 * Defines a class to build a listing of Event registration entities.
 *
 * @ingroup htm_custom_event_registration
 */
class EventRegEntityListBuilder extends EntityListBuilder {


  /**
   * {@inheritdoc}
   */
  public function buildHeader() {
    $header['id'] = $this->t('Event registration ID');
    $header['name'] = $this->t('Name');
    $header['first_name'] = $this->t('First name');
		$header['last_name'] = $this->t('Last name');
		$header['email'] = $this->t('Email');
		$header['event_name'] = $this->t('Event');
		$header['registration_date'] = $this->t('Registration date');
    return $header + parent::buildHeader();
  }

  /**
   * {@inheritdoc}
   */
  public function buildRow(EntityInterface $entity) {
    /* @var $entity \Drupal\htm_custom_event_registration\Entity\EventRegEntity */
    $row['id'] = $entity->id();
    $row['name'] = Link::createFromRoute(
      $entity->label(),
      'entity.event_reg_entity.edit_form',
      ['event_reg_entity' => $entity->id()]
    );
    $row['first_name'] = $entity->get('participant_first_name')->value;
    $row['last_name'] = $entity->get('participant_last_name')->value;
    $row['email'] = $entity->get('participant_email')->value;

    /*TODO Make reference URL dynamical*/
    $row['event_name'] = ($ref = $entity->get('event_reference')->entity) ? Link::fromTextAndUrl(
    		$ref->getTitle(), Url::fromRoute('entity.node.canonical', ['node' => $ref->nid->value]), array('attributes' => array('target' => '_blank'))
		) : '';

    $row['registration_date'] = DrupalDateTime::createFromTimestamp((int) $entity->get('created')->value)->format('d/m/Y H:i:s');


    return $row + parent::buildRow($entity);
  }

}
