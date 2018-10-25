<?php

namespace Drupal\htm_custom_ehis_connector;

use Drupal\Component\Datetime\DateTimePlus;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\redis\ClientFactory;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class EhisConnectorService.
 */
class EhisConnectorService {

	/**
	 * Service default endpoint
	 */
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
	 * @var Current user role
	 */
	protected $currentRole;


	/**
	 * xJsonService constructor.
	 * @param AccountProxyInterface $current_user
	 * @param \Drupal\redis\ClientFactory $client_factory
	 */
	public function __construct(
			AccountProxyInterface $current_user,
			ClientFactory $client_factory,
			LoggerChannelFactoryInterface $logger) {
		$this->currentUser = $current_user;
		$this->client = $client_factory->getClient();
		$this->logger = $logger->get('ehis_connector_service');
		$this->currentRole = \Drupal::service('current_user.role_switcher')->getCurrentRole();
	}

	/**
	 * @param      $service_name
	 * @param      $params
	 * @param bool $poll
	 * @return array|mixed|\Psr\Http\Message\ResponseInterface
	 */
	private function invokeWithRedis ($service_name, $params, $poll = TRUE) {
		switch ($poll){
			case TRUE:
				$start_time = DateTimePlus::createFromDateTime(new \Datetime());
				do {
					$current_time = DateTimePlus::createFromDateTime(new \Datetime());
					$diff_sec = $start_time->diff($current_time, TRUE)->s;
					if($redis_response = $this->getValue($params['key'], $params['hash'])){
						$redis_response['redis_hit'] = TRUE;
						return $redis_response;
					}
				} while ($diff_sec < 3 && empty($redis_response));

				return ['found' => NULL];

				break;
			default:
				if($redis_response = $this->getValue($params['key'], $params['hash'])){
					$redis_response['redis_hit'] = TRUE;
					return $redis_response;
				}else{
					return $this->invoke($service_name, $params);
				}
				break;
		}

	}

	/**
	 * @param $service_name
	 * @param $params
	 * @return mixed|\Psr\Http\Message\ResponseInterface
	 */
	private function invoke($service_name, $params, $type = 'get'){
		$client = \Drupal::httpClient();
		try {
			/*TODO make post URL configurable*/
			if($type === 'get'){
				$response = $client->get(self::LOIME_DEFAULT_URL.$service_name . '/' . implode($params['url'], '/'));
			}elseif($type === 'post'){
				$response = $client->post(self::LOIME_DEFAULT_URL.$service_name, $params);
			}else{
				//TODO throw error
			}
			$response = json_decode($response->getBody()->getContents(), TRUE);
			return $response;
		}catch (RequestException $e){
			throw new HttpException($e->getCode(), $e->getMessage());
		}
	}

	/**
	 * @param $key
	 * @param $field
	 * @return array|mixed
	 */
	private function getValue($key, $field){
		$response = [];
		if($data = $this->client->hGet($key, $field)){
			$response = json_decode($data, TRUE);
		}
		return $response;
	}

	/**
	 * @param Base64Image $img
	 * @param             $key
	 * @return bool|int
	 */
	public function saveFileToRedis(Base64Image $img, $key){
		return $this->client->hset($key, $img->getFileIdentifier(), $img->getRawData());
	}


	/**
	 * @param bool $idcode
	 *  If true return IDcode
	 * @return mixed
	 */
	private function getCurrentUserIdRegCode($idcode = TRUE){
		if($this->useReg() || !$idcode){
			return $this->currentRole['current_role']['data']['reg_kood'];
		}else{
			#return '37112110025';
			return $this->currentUser->getIdCode();
		}
	}

	private function useReg(){
		if($this->currentRole['current_role']['type'] === 'juridical_person') return true;
		return false;
	}

	/**
	 * @param array $params
	 * @return array|mixed|\Psr\Http\Message\ResponseInterface
	 */
	public function getProfessionalCertificate(array $params = []){
		// build url params for GET request
		$params['url'] = [$this->getCurrentUserIdRegCode(), 'true', time()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'kodanikKutsetunnistus';
		return $this->invokeWithRedis('kodanikKutsetunnistus', $params, FALSE);
	}

	public function getTestSessions(array $params = []){
		$params['url'] = [$this->getCurrentUserIdRegCode(), time()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'testsessioonidKod';
		return $this->invokeWithRedis('testsessioonidKod', $params, FALSE);
	}

	public function gettestidKod(array $params = []){
		$params['url'] = [$this->getCurrentUserIdRegCode(), $params['session_id'], time()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'testidKod_'.$params['session_id'];
		return $this->invokeWithRedis('testidKod', $params, FALSE);
	}

	public function getCertificate(array $params = []){
		$params['url'] = [$this->getCurrentUserIdRegCode(), $params['certificate_id'], time()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'eTunnistusKod_'.$params['certificate_id'];
		return $this->invokeWithRedis('eTunnistusKod', $params, FALSE);
	}

	/**
	 * @param array $params
	 * @return mixed
	 */
	public function getPersonalCard(array $params = []){
		$params['url'] = [$this->getCurrentUserIdRegCode(), time()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'eeIsikukaart';
 		$response = $this->invokeWithRedis('eeIsikukaart', $params, FALSE);
		return $this->filterPersonalCard($response, $params['tab']);
	}

	/**
	 * @param array $params
	 * @return array|mixed|\Psr\Http\Message\ResponseInterface
	 */
	public function getApplications(array $params = []){
		$params['url'] = [$this->getCurrentUserIdRegCode()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		#dump($params['init']);
		// we need to start getDocument service
		if($params['init']){
			$params['hash'] = 'getDocuments';
			$init = $this->invokeWithRedis('getDocuments', $params, FALSE);
			if(!isset($init['MESSAGE']) && $init['MESSAGE'] != 'WORKING') {
				throw new RequestException('Service down');
			}
		}

		if($this->useReg()) $params['hash'] = 'mtsys';
		if(!$this->useReg()) $params['hash'] = 'vpTaotlus';
		#dump($params);
		$response = $this->invokeWithRedis('vpTaotlus', $params);
		$this->getFormDefinitionTitle($response, $params['hash']);
		return $response;
	}

	public function getDocument(array $params = []){
		$params['url'][] = $this->getCurrentUserIdRegCode();
		return $this->invokeWithRedis('getDocument', $params, FALSE);
	}

	public function postDocument(array $params = []){
		return $this->invoke('postDocument', $params, 'post');
	}

	public function getDocumentFile(array $params = []){
		$params['url'] = [$params['file_id'], $this->getCurrentUserIdRegCode()];
		return $this->invokeWithRedis('getDocumentFile', $params, FALSE);
	}

	public function getUserRoles(array $params = []){
		/* @TODO $lang_code later as variable */
		$lang_code = 'EST';
		$params['url'] = [$this->getCurrentUserIdRegCode(), $lang_code, time()];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'esindusOigus';
		return $this->invokeWithRedis('esindusOigus', $params, FALSE);
	}

	public function getOptionsTaxonomy(array $params = []){
		$params['key'] = 'klassifikaator';
		$return = $this->invokeWithRedis('mtsysKlfTeenus', $params, FALSE);
		if(!$return['redis_hit']){

			return (isset($return[$params['hash']])) ? $return[$params['hash']] : [];
		}
		return $return;
	}

	public function getEducationalInstitution(array $params = []){
		$params['url'] = [$params['id'], $this->getCurrentUserIdRegCode(), $this->getCurrentUserIdRegCode(TRUE)];
		$params['key'] = $this->getCurrentUserIdRegCode();
		$params['hash'] = 'educationalInstitution_'.$params['id'];
		return $this->invokeWithRedis('getEducationalInstitution', $params, FALSE);
	}

	/**
	 * @param $input
	 * @param $tab
	 * @return mixed
	 */
	private function filterPersonalCard($input, $tab){
		switch ($tab){
			case 'studies':
				$keys = ['oping'];
				break;
			case 'teachings':
				$keys = ['tootamine', 'taiendkoolitus', 'tasemeharidus', 'kvalifikatsioon'];
				break;
			case 'personal_data':
				$keys = ['isikuandmed'];
				break;
			default:
				$keys = [];
				break;
		}

		foreach($input['value'] as $key => $value){
			if(!in_array($key, $keys)) unset($input['value'][$key]);
		}

		return $input;
	}
	private function getxJsonService(){
		return \Drupal::service('htm_custom_xjson_services.default');
	}

	private function getFormDefinitionTitle(&$response, $type){
		$form_topics = ['documents', 'drafts', 'acceptable_forms'];

		switch ($type){
			case 'mtsys':
				foreach($response['educationalInstitutions'] as &$educationalInstitution){
					$this->appendFormTitle($educationalInstitution, $form_topics);
				}
				break;
			case 'vpTaotlus':
				$this->appendFormTitle($response, $form_topics);
				break;
		}

		return $response;
	}

	private function appendFormTitle(&$obj, $form_topics){
		array_walk($obj, function (&$value, $key, $form_topics){
			if(in_array($key, $form_topics)){
				foreach($value as &$item){
					$d = self::getxJsonService()->getEntityJsonObject($item['form_name']);
					if($d){
						$item['title'] = $d['body']['title'];
					}else{
						$item['title'] = ['et' => 'Puudub', 'en' => 'Not Found'];
					}
				}
			}
		}, $form_topics);

		return $obj;

	}



}
