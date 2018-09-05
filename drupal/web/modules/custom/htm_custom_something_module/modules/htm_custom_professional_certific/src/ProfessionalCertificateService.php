<?php

namespace Drupal\htm_custom_professional_certific;

use Drupal\Core\Session\AccountProxyInterface;
use Drupal\redis\ClientFactory;
use Drupal\rest\ModifiedResourceResponse;
use GuzzleHttp\Exception\RequestException;

/**
 * Class ProfessionalCertificateService.
 */
class ProfessionalCertificateService {

	const LOIME_DEFAULT_URL = 'test-htm.wiseman.ee:30080/api/';
	/**
	 * @var \Redis
	 */
	protected $client;

	/**
	 * Drupal\Core\Session\AccountProxyInterface definition.
	 *
	 * @var \Drupal\Core\Session\AccountProxyInterface
	 */
	protected $currentUser;

	/**
	 * xJsonService constructor.
	 * @param AccountProxyInterface $current_user
	 * @param \Drupal\redis\ClientFactory $client_factory
	 */
	public function __construct(
			AccountProxyInterface $current_user,
			ClientFactory $client_factory) {
		$this->currentUser = $current_user;
		$this->client = $client_factory->getClient();
	}


	private function invokeWithRedis ($service_name, $params) {
		if($redis_response = $this->getValue($params['key'], $params['field'])){
			$redis_response['redis_hit'] = TRUE;
			return $redis_response;
		}else{
			$client = \Drupal::httpClient();
			try {
				/*TODO make post URL configurable*/
				$response = $client->get(self::LOIME_DEFAULT_URL.$service_name . '/' . implode($params['url'], '/'));
				$response = json_decode($response->getBody()->getContents(), TRUE);
				$response['redis_hit'] = FALSE;
				return $response;
			}catch (RequestException $e){
				throw $e;
			}
		}
		return NULL;
	}

	private function invoke($service_name, $params){
		$client = \Drupal::httpClient();
		try {
			/*TODO make post URL configurable*/
			$response = $client->get(self::LOIME_DEFAULT_URL.$service_name);
			return json_decode($response->getBody()->getContents(), TRUE);
		}catch (RequestException $e){
			return new ModifiedResourceResponse($e->getMessage(), $e->getCode());
		}
	}

	// put dummydata
	public function test(){
		$json = '{\"request_timestamp\":1234,\"response_timestamp\":1536053148436,\"key\":\"kutsetunnistused_39505090897\",\"value\":{\"kirjeid\":1,\"teade\":null,\"kutsetunnistused\":[{\"registrinumber\":\"106697\",\"nimi\":\"nimi10587570\",\"isikukood\":\"39505090897\",\"synniaeg\":null,\"tyyp\":\"kutsetunnistus\",\"standard\":\"Turvasüsteemide tehnik, tase 5\",\"ekrtase\":5,\"eqftase\":5,\"spetsialiseerumine\":null,\"osakutse\":null,\"lisavali\":null,\"kompetentsid\":\"Turvasüsteemide paigaldamine ja hooldamine; Tulekahjusignalisatsioonisüsteemi paigaldamine ja hooldamine\",\"valdkond\":\"IT, TELEKOMMUNIKATSIOON JA ELEKTROONIKA\",\"kutseala\":\"Elektroonika\",\"hariduslikkval\":null,\"keel\":\"eesti keel\",\"valjastaja\":\"Eesti Turvaettevõtete Liit\",\"valjaantud\":\"2016-01-28\",\"kehtibalates\":\"2016-01-28\",\"kehtibkuni\":\"2019-01-27\",\"isco\":\"3 Tehnikud ja keskastme spetsialistid: Loodus- ja inseneriteaduste keskastme spetsialistid\",\"reaid\":null,\"duplikaat\":null,\"kehtetu\":null,\"kustutatud\":null}]}}';
		$clean = str_replace('\\"', '"', $json);
		$this->client->hset('KUTSEREGISTER', 'kutsetunnistused_39505090897', $clean);
	}

	private function getValue($key, $field){
		$response = [];
		if($data = $this->client->hGet($key, $this->buildHash($field))){
			$response = json_decode($data, TRUE);
		}

		return $response;
	}

	public function getProfessionalCertificate(array $params){
		// build url params for GET request
		$params['url'] = [$this->getCurrentUserIdCode(), 'true', time()];
		return $this->invokeWithRedis('kodanikKutsetunnistus', $params);
	}

	private function buildHash($field){
		#return (string) $field . '111';
		return (string) $field . $this->getCurrentUserIdCode();
	}


	private function getCurrentUserIdCode(){
		$account = $this->currentUser->getAccount();
		return ($id_code = $account->get('field_user_idcode')->value) ? $id_code : 0;
	}



}
