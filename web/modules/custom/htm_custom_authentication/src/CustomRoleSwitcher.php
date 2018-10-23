<?php

namespace Drupal\htm_custom_authentication;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\htm_custom_ehis_connector\EhisConnectorService;
use Drupal\user\UserDataInterface;
use GuzzleHttp\Exception\BadResponseException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CustomRoleSwitcher {
	/**
	 * Drupal\Core\Session\AccountProxyInterface definition.
	 *
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $currentUser;

	/**
	 * @var \Drupal\user\UserDataInterface
	 */
	protected $userData;

	public function __construct (
			AccountProxyInterface $current_user,
			UserDataInterface $user_data) {
		$this->currentUser = $current_user;
		$this->userData = $user_data;
	}

	public function setNaturalPerson(){
		$this->setUserData(['type' => 'natural_person']);
	}

	public function setJuridicalPerson($id = NULL){

		$roles = \Drupal::service('htm_custom_ehis_connector.default')->getUserRoles();

		$d = array_column($roles, 'ettevotted', 'ariregistri_kood');
		$d = reset($d);
		foreach($d as $da){
			if(array_search($id, $da, true)){
				$this->setUserData([
					'type' => 'juridical_person',
					'data' => [
						'reg_kood' => $da['ariregistri_kood'],
						'nimi' => $da['arinimi']
					]
				]);
				return true;
			}
		}
		$this->setNaturalPerson();
		throw new HttpException('400', 'ID not found');
	}

	public function getCurrentRole(){
		return $this->userData->get('CustomRoleSwitcher', $this->currentUser->getIdCode());
	}

	public function getAvailableRoles(){
		return $this->ehisConnector->getUserRoles();
	}

	private function setUserData($role){
		$this->userData->set('CustomRoleSwitcher', $this->currentUser->getIdCode(), 'current_role', $role);
	}

}