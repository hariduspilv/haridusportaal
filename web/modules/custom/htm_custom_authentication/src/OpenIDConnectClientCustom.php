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
		$body = json_decode(base64url_decode($parts[1]));
		$payload = implode(".", $parts);
		dump($parts);
		dump($signature);
		dump($header);
		dump($payload);
		dump($body);
		#dump($jwt);
		return parent::verifyJWTsignature($jwt);
	}

	/**
	 * @param object $claims
	 * @return bool
	 */
	private function verifyJWTclaims($claims, $accessToken = null) {
		dump('läks see!');
		/*if(isset($claims->at_hash) && isset($accessToken)){
			if(isset($this->getAccessTokenHeader()->alg) && $this->getAccessTokenHeader()->alg != 'none'){
				$bit = substr($this->getAccessTokenHeader()->alg, 2, 3);
			}else{
				// TODO: Error case. throw exception???
				$bit = '256';
			}
			$len = ((int)$bit)/16;
			$expecte_at_hash = $this->urlEncode(substr(hash('sha'.$bit, $accessToken, true), 0, $len));
		}
		return (($claims->iss == $this->getIssuer() || $claims->iss == $this->getWellKnownIssuer() || $claims->iss == $this->getWellKnownIssuer(true))
			&& (($claims->aud == $this->clientID) || (in_array($this->clientID, $claims->aud)))
			&& ($claims->nonce == $this->getNonce())
			&& ( !isset($claims->exp) || $claims->exp >= time() - $this->leeway)
			&& ( !isset($claims->nbf) || $claims->nbf <= time() + $this->leeway)
			&& ( !isset($claims->at_hash) || $claims->at_hash == $expecte_at_hash )
		);*/
	}


}