<?php

namespace Drupal\htm_custom_authentication\Authentication\Provider;


use Drupal\Core\Entity\EntityManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\externalauth\AuthmapInterface;
use Drupal\externalauth\Event\ExternalAuthEvents;
use Drupal\externalauth\Event\ExternalAuthLoginEvent;
use Drupal\externalauth\ExternalAuth;
use Drupal\user\UserInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;

class CustomExternalAuth extends ExternalAuth{

	protected $jsonAuth;

	public function __construct (EntityTypeManagerInterface $entity_manager, AuthmapInterface $authmap, LoggerInterface $logger, EventDispatcherInterface $event_dispatcher, JsonAuthenticationProvider $jsonAuthenticationProvider) {
		#parent::__construct($entity_manager, $authmap, $logger, $event_dispatcher);
		$this->entityManager = $entity_manager;
		$this->authmap = $authmap;
		$this->logger = $logger;
		$this->eventDispatcher = $event_dispatcher;
		$this->jsonAuth = $jsonAuthenticationProvider;
	}

	public function load ($authname, $provider) {
		$user = $this->entityManager->getStorage('user')->loadByProperties(['field_user_idcode' => $provider]);
		$user = reset($user);

		return $user;
	}


	/**
	 * {@inheritdoc}
	 *
	 * @codeCoverageIgnore
	 */
	public function userLoginFinalize(UserInterface $account, $authname, $provider) {
		user_login_finalize($account);
		$this->logger->notice('External login of user %name', ['%name' => $account->getAccountName()]);
		$this->eventDispatcher->dispatch(ExternalAuthEvents::LOGIN, new ExternalAuthLoginEvent($account, $provider, $authname));
		$token = $this->jsonAuth->generateToken();
		user_logout();

		return $token;
	}


}