<?php

namespace Drupal\htm_custom_authentication\Authentication\Provider;

use Drupal\jwt\Authentication\Provider\JwtAuth;
use Drupal\Core\Authentication\AuthenticationProviderInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * JWT Authentication Provider.
 */
class CustomJwtAuth extends JwtAuth implements AuthenticationProviderInterface {

	/**
	 * @param Request $request
	 * @return bool|false|int
	 */
	public function applies (Request $request) {
		$auth = $request->headers->get('Authorization');
		$auth_param = $request->get('jwt_token');
		return (preg_match('/^Bearer .+/', $auth) || $auth_param);
	}


	/**
	 * @param Request $request
	 * @return bool|mixed|string
	 */
	protected function getJwtFromRequest (Request $request) {
		$auth_header = $request->headers->get('Authorization');
		dump($auth_header);
		$auth_param = $request->get('jwt_token');
		$matches = [];
		if ($hasJWT = preg_match('/^Bearer (.*)/', $auth_header, $matches)) {
			$return = $matches[1];
		} elseif ($auth_param) {
			$return = $auth_param;
		} else {
			$return = false;
		}

		return $return;
	}


}
