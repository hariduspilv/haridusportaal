<?php

namespace Drupal\htm_custom_tara_authentication\Controller;

use Drupal\openid_connect\Controller\RedirectController;

class TaraRedirectController extends RedirectController{
	public function authenticate ($client_name) {
		$parent_auth = parent::authenticate($client_name);
		drupal_get_messages();
		dump($parent_auth);
		die();
	}

}