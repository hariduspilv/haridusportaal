<?php

namespace Drupal\jwt_auth_consumer\EventSubscriber;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\jwt\Authentication\Event\JwtAuthValidateEvent;
use Drupal\jwt\Authentication\Event\JwtAuthValidEvent;
use Drupal\jwt\Authentication\Event\JwtAuthEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class JwtAuthConsumerSubscriber.
 *
 * @package Drupal\jwt_auth_consumer
 */
class JwtAuthConsumerSubscriber implements EventSubscriberInterface {

  /**
   * Entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity manager service.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[JwtAuthEvents::VALIDATE][] = ['validate'];
    $events[JwtAuthEvents::VALID][] = ['loadUser'];

    return $events;
  }

  /**
   * Validates that a uid is present in the JWT.
   *
   * This validates the format of the JWT and validate the uid is a
   * valid uid in the system.
   *
   * @param \Drupal\jwt\Authentication\Event\JwtAuthValidateEvent $event
   *   A JwtAuth event.
   */
  public function validate(JwtAuthValidateEvent $event) {
    $token = $event->getToken();
    $uid = $token->getClaim(['drupal', 'uid']);
    if ($uid === NULL) {
      $event->invalidate('No Drupal uid was provided in the JWT payload.');
      return;
    }
    $user = $this->entityTypeManager->getStorage('user')->load($uid);
    if ($user === NULL) {
      $event->invalidate('No UID exists.');
      return;
    }
    if ($user->isBlocked()) {
      $event->invalidate('User is blocked.');
    }
  }

  /**
   * Load and set a Drupal user to be authentication based on the JWT's uid.
   *
   * @param \Drupal\jwt\Authentication\Event\JwtAuthValidEvent $event
   *   A JwtAuth event.
   */
  public function loadUser(JwtAuthValidEvent $event) {
    $token = $event->getToken();
    $user_storage = $this->entityTypeManager->getStorage('user');
    $uid = $token->getClaim(['drupal', 'uid']);
    $user = $user_storage->load($uid);
    $event->setUser($user);
  }

}
