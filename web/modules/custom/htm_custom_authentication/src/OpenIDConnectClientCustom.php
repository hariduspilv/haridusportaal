<?php

namespace  Drupal\htm_custom_authentication;

use Jumbojett\OpenIDConnectClient;

class OpenIDConnectClientCustom extends OpenIDConnectClient {
	public function verifyJWTsignature ($jwt) {
		dump($jwt);
		return parent::verifyJWTsignature($jwt);
	}

	public function getVerifiedClaims ($attribute = null) {
		return parent::getVerifiedClaims($attribute);
	}
}