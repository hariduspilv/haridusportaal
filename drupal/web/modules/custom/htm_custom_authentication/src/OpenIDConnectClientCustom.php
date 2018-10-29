<?php

namespace  Drupal\htm_custom_authentication;

use Jumbojett\OpenIDConnectClient;

/**
 * A wrapper around base64_decode which decodes Base64URL-encoded data,
 * which is not the same alphabet as base64.
 */
function base64url_decode($base64url) {
	return base64_decode(b64url2b64($base64url));
}

/**
 * Per RFC4648, "base64 encoding with URL-safe and filename-safe
 * alphabet".  This just replaces characters 62 and 63.  None of the
 * reference implementations seem to restore the padding if necessary,
 * but we'll do it anyway.
 *
 */
function b64url2b64($base64url) {
	// "Shouldn't" be necessary, but why not
	$padding = strlen($base64url) % 4;
	if ($padding > 0) {
		$base64url .= str_repeat("=", 4 - $padding);
	}
	return strtr($base64url, '-_', '+/');
}

class OpenIDConnectClientCustom extends OpenIDConnectClient {
	public function verifyJWTsignature ($jwt) {
		$parts = explode(".", $jwt);
		$signature = base64url_decode(array_pop($parts));
		$header = json_decode(base64url_decode($parts[0]));
		$payload = implode(".", $parts);
		dump($parts);
		dump($signature);
		dump($header);
		dump($payload);
		dump($jwt);
		return parent::verifyJWTsignature($jwt);
	}

	public function getVerifiedClaims ($attribute = null) {
		return parent::getVerifiedClaims($attribute);
	}
}