<?php
namespace  Drupal\htm_custom_authentication;

use Drupal\Core\Session\AccountProxy;
use Drupal\Core\Session\UserSession;
use Drupal\user\Entity\User;

class CustomAccountProxy extends AccountProxy{

	public function getIdCode(){
		$account = $this->getAccount();
		if($this->isAuthenticated()){
			if($account instanceof UserSession){
				$user = User::load($account->id());
			}elseif($account instanceof User){
				$user = $account;
			}
			return $user->get('field_user_idcode')->value;
		}
		return 0;
	}
}