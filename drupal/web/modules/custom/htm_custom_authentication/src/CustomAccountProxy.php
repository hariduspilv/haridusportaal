<?php
namespace  Drupal\htm_custom_authentication;

use Drupal\Core\Session\AccountProxy;

class CustomAccountProxy extends AccountProxy{

	public function getIdCode(){
		return $this->getAccount()->get('field_user_idcode')->value;
	}
}