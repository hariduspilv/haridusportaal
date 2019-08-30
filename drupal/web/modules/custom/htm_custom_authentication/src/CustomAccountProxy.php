<?php
namespace  Drupal\htm_custom_authentication;

use Drupal\Core\Session\AccountProxy;
use Drupal\Core\Session\UserSession;
use Drupal\user\Entity\User;

/**
 * Class CustomAccountProxy
 *
 * @package Drupal\htm_custom_authentication
 */
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

  public function getFirstName(){
    $account = $this->getAccount();
    if($this->isAuthenticated()){
      if($account instanceof UserSession){
        $user = User::load($account->id());
      }elseif($account instanceof User){
        $user = $account;
      }
      return $user->get('field_firstname')->value;
    }
    return 0;
  }

  public function getLastName(){
    $account = $this->getAccount();
    if($this->isAuthenticated()){
      if($account instanceof UserSession){
        $user = User::load($account->id());
      }elseif($account instanceof User){
        $user = $account;
      }
      return $user->get('field_lastname')->value;
    }
    return 0;
  }
}
