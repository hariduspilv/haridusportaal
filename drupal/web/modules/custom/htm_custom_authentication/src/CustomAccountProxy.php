<?php
namespace  Drupal\htm_custom_authentication;

use Drupal\Core\Session\AccountProxy;
use Drupal\user\Entity\User;

class CustomAccountProxy extends AccountProxy{

	public function getIdCode(){
		if($this->isAuthenticated() && $this->getAccount() instanceof User) return $this->getAccount()->get('field_user_idcode')->value;
		else return 0;
	}
}