<?php

namespace Drupal\jwt_auth_consumer\EventSubscriber;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\jwt\Authentication\Event\JwtAuthValidateEvent;
use Drupal\jwt\Authentication\Event\JwtAuthValidEvent;
use Drupal\jwt\Authentication\Event\JwtAuthEvents;
use Drupal\jwt\JsonWebToken\JsonWebTokenInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Class JwtAuthConsumerSubscriber.
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
   * Find and load the user for a JWT.
   *
   * @param \Drupal\jwt\JsonWebToken\JsonWebTokenInterface $token
   *   The JWT.
   *
   * @return array
   *   The user and reason if no user was loaded.
   *
   * @throws \Drupal\Component\Plugin\Exception\InvalidPluginDefinitionException
   * @throws \Drupal\Component\Plugin\Exception\PluginNotFoundException
   */
  protected function loadUserForJwt(JsonWebTokenInterface $token): array {
    foreach (['uid', 'uuid', 'name'] as $id_type) {
      $id = $token->getClaim(['drupal', $id_type]);
      if ($id !== NULL) {
        break;
      }
    }
    if ($id === NULL) {
      return [
        NULL,
        'No Drupal uid, uuid, or name was provided in the JWT payload.',
      ];
    }
    $user_storage = $this->entityTypeManager->getStorage('user');
    if ($id_type === 'uid') {
      $user = $user_storage->load($id);
    }
    else {
      $user = current($user_storage->loadByProperties([$id_type => $id]));
    }
    if (!$user) {
      return [NULL, 'User does not exist.'];
    }
    if ($user->isBlocked()) {
      return [NULL, 'User is blocked.'];
    }
    return [$user, NULL];
  }

  /**
   * Validates that a uid, uuid, or name is present in the JWT.
   *
   * This validates the format of the JWT and validate the uid, uuid, or name
   * corresponds to a valid user in the system.
   *
   * @param \Drupal\jwt\Authentication\Event\JwtAuthValidateEvent $event
   *   A JwtAuth event.
   */
  public function validate(JwtAuthValidateEvent $event) {
    $token = $event->getToken();
    [$user, $reason] = $this->loadUserForJwt($token);
    if (!$user) {
      $event->invalidate($reason);
    }
    elseif (!$token->getClaim(['drupal', 'uid'])) {
      // Set the uid claim to simplify the code path in other subscribers and
      // to make the loadUser step more efficient.
      $token->setClaim(['drupal', 'uid'], (int) $user->id());
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
    [$user] = $this->loadUserForJwt($token);
    $event->setUser($user);
  }

}
