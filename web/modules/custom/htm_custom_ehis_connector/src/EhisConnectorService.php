<?php

namespace Drupal\htm_custom_ehis_connector;

use Drupal\Component\Datetime\DateTimePlus;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\redis\ClientFactory;
use Drupal\user\Entity\User;
use GuzzleHttp\Exception\RequestException;
use Psr\Log\LoggerInterface;

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
	private function invoke($service_name, $params){
		$client = \Drupal::httpClient();
		try {
			/*TODO make post URL configurable*/
			$response = $client->get(self::LOIME_DEFAULT_URL.$service_name . '/' . implode($params['url'], '/'));
			$response = json_decode($response->getBody()->getContents(), TRUE);
			return $response;
		}catch (RequestException $e){
			throw $e;
		}
	}

	public function test(){
		$json = '{\"request_timestamp\":1234,\"response_timestamp\":1536053148436,\"key\":\"kutsetunnistused_39505090897\",\"value\":{\"kirjeid\":1,\"teade\":null,\"kutsetunnistused\":[{\"registrinumber\":\"106697\",\"nimi\":\"nimi10587570\",\"isikukood\":\"39505090897\",\"synniaeg\":null,\"tyyp\":\"kutsetunnistus\",\"standard\":\"Turvasüsteemide tehnik, tase 5\",\"ekrtase\":5,\"eqftase\":5,\"spetsialiseerumine\":null,\"osakutse\":null,\"lisavali\":null,\"kompetentsid\":\"Turvasüsteemide paigaldamine ja hooldamine; Tulekahjusignalisatsioonisüsteemi paigaldamine ja hooldamine\",\"valdkond\":\"IT, TELEKOMMUNIKATSIOON JA ELEKTROONIKA\",\"kutseala\":\"Elektroonika\",\"hariduslikkval\":null,\"keel\":\"eesti keel\",\"valjastaja\":\"Eesti Turvaettevõtete Liit\",\"valjaantud\":\"2016-01-28\",\"kehtibalates\":\"2016-01-28\",\"kehtibkuni\":\"2019-01-27\",\"isco\":\"3 Tehnikud ja keskastme spetsialistid: Loodus- ja inseneriteaduste keskastme spetsialistid\",\"reaid\":null,\"duplikaat\":null,\"kehtetu\":null,\"kustutatud\":null}]}}';
		$clean = str_replace('\\"', '"', $json);
		$this->client->hset('47108249296', 'kodanikKutsetunnistus', $clean);
	}
	public function testeeIsikukaart(){
		$json = '{"request_timestamp":1537281631,"response_timestamp":1537281636218,"key":"eeisikukaart_47108249296","value":{"isikuandmed":{"isikukood":"47108249296","synniKp":"1971-08-23","eesnimi":"EN_309342","perenimi":"PN_309342","elukohamaa":"Eesti","rrElukoht":"Harju maakond, Anija vald, Pikva küla (Anija vald)","kodakondsus":"Eesti","elamisluba":null,"oppelaenOigus":[]},"oping":[{"haridustase":"YLIKOOL","oppeasutus":"Tallinna Ülikool","oppAlgus":"24.08.2009","oppLopp":"05.06.2013","oppekava":[{"klOppekava":null,"oppekavaKood":"1606","oppekavaNimetus":"Käsitöö ja kodundus"}],"oppekeel":null,"opeklass":"511 bakalaureuseõpe (vv alates 01.06.2002)","opeParallel":null,"klassiLiik":null,"klassAste":null,"oppevorm":[{"nimetus":"kaugõpe","algusKp":"2009-08-23","loppKp":null},{"nimetus":"täiskoormusega õpe","algusKp":"2009-08-23","loppKp":null}],"koormus":[],"kestus":"3 aastat","oppekavataitine":[],"ryhmaLiik":null,"nimetus":null,"koht":null,"finAllikas":[{"nimetus":"Riigieelarveline riikliku koolitustellimuse õppekoht","algusKp":"2009-08-23","loppKp":null}],"akadPuhkus":[],"ennistamine":[],"puudumised":null,"staatus":"Lõpetanud","tunnistusDiplom":"LC008330","kutseKoolitus":[]},{"haridustase":"YLIKOOL","oppeasutus":"Tallinna Ülikool","oppAlgus":"21.08.2013","oppLopp":"02.06.2016","oppekava":[{"klOppekava":null,"oppekavaKood":"1631","oppekavaNimetus":"Käsitöö ja kodunduse õpetaja"}],"oppekeel":null,"opeklass":"614 magistriõpe (3+2)","opeParallel":null,"klassiLiik":null,"klassAste":null,"oppevorm":[{"nimetus":"kaugõpe","algusKp":"2013-08-20","loppKp":null},{"nimetus":"täiskoormusega õpe","algusKp":"2013-08-20","loppKp":null}],"koormus":[],"kestus":"2 aastat","oppekavataitine":[],"ryhmaLiik":null,"nimetus":null,"koht":null,"finAllikas":[{"nimetus":"Üliõpilane ei hüvita õppekulusid:  õpib täies mahus eestikeelsel õppekaval","algusKp":"2014-03-11","loppKp":null},{"nimetus":"Riigieelarveline riikliku koolitustellimuse õppekoht","algusKp":"2013-08-20","loppKp":"2014-03-10"}],"akadPuhkus":[],"ennistamine":[],"puudumised":null,"staatus":"Lõpetanud","tunnistusDiplom":"MC006209","kutseKoolitus":[]}],"tootamine":[{"liik":"POHIKOOL","oppeasutus":"Alavere Põhikool","oppeasutusId":609,"ametikoht":"õpetaja","ametikohtAlgus":"2012-08-14","ametikohtLopp":"2013-06-13","onTunniandja":1,"onOppejoud":0,"kehtiv":0,"taitmiseViis":null,"amtikohtKoormus":0.61,"tooleping":null,"ametikohtKvalVastavus":"Ei","ametijark":null,"oppekava":[],"oppeaine":[{"oppeaine":"Kunstiõpetus","kooliaste":"II kooliaste - 4.-6. klass","maht":1,"kvalVastavus":null},{"oppeaine":"Tehnoloogiaõpetus","kooliaste":"III kooliaste - 7.-9. klass","maht":4,"kvalVastavus":null},{"oppeaine":"Kunstiõpetus","kooliaste":"III kooliaste - 7.-9. klass","maht":3,"kvalVastavus":null},{"oppeaine":"Tehnoloogiaõpetus","kooliaste":"II kooliaste - 4.-6. klass","maht":2,"kvalVastavus":null}],"haridustase":null,"lapsehooldusPuhkus":"Ei"},{"liik":"POHIKOOL","oppeasutus":"Alavere Põhikool","oppeasutusId":609,"ametikoht":"ringijuht","ametikohtAlgus":"2012-08-14","ametikohtLopp":"2013-06-13","onTunniandja":1,"onOppejoud":0,"kehtiv":0,"taitmiseViis":null,"amtikohtKoormus":0.14,"tooleping":null,"ametikohtKvalVastavus":"Ei","ametijark":null,"oppekava":[],"oppeaine":[{"oppeaine":"Ringitunnid","kooliaste":"II kooliaste - 4.-6. klass","maht":3,"kvalVastavus":null}],"haridustase":null,"lapsehooldusPuhkus":"Ei"},{"liik":"POHIKOOL","oppeasutus":"Mattiase Põhikool","oppeasutusId":4411,"ametikoht":"õpetaja","ametikohtAlgus":"2013-08-31","ametikohtLopp":"2013-12-26","onTunniandja":1,"onOppejoud":0,"kehtiv":0,"taitmiseViis":null,"amtikohtKoormus":0.15,"tooleping":null,"ametikohtKvalVastavus":"Ei","ametijark":null,"oppekava":[],"oppeaine":[{"oppeaine":"Tööõpetus","kooliaste":"I kooliaste - 1.-3. klass","maht":2,"kvalVastavus":null},{"oppeaine":"Tööõpetus","kooliaste":"II kooliaste - 4.-6. klass","maht":1,"kvalVastavus":null}],"haridustase":null,"lapsehooldusPuhkus":"Ei"},{"liik":"POHIKOOL","oppeasutus":"Aegviidu Kool","oppeasutusId":650,"ametikoht":"õpetaja","ametikohtAlgus":"2013-08-25","ametikohtLopp":"2014-06-19","onTunniandja":1,"onOppejoud":0,"kehtiv":0,"taitmiseViis":null,"amtikohtKoormus":0.25,"tooleping":null,"ametikohtKvalVastavus":"Ei","ametijark":null,"oppekava":[],"oppeaine":[{"oppeaine":"Tehnoloogiaõpetus","kooliaste":"II kooliaste - 4.-6. klass","maht":2,"kvalVastavus":null},{"oppeaine":"Tehnoloogiaõpetus","kooliaste":"III kooliaste - 7.-9. klass","maht":4,"kvalVastavus":null}],"haridustase":null,"lapsehooldusPuhkus":"Ei"},{"liik":"POHIKOOL","oppeasutus":"Aegviidu Kool","oppeasutusId":650,"ametikoht":"õpetaja","ametikohtAlgus":"2015-08-16","ametikohtLopp":null,"onTunniandja":1,"onOppejoud":0,"kehtiv":1,"taitmiseViis":null,"amtikohtKoormus":0.54,"tooleping":null,"ametikohtKvalVastavus":"Jah","ametijark":null,"oppekava":[],"oppeaine":[{"oppeaine":"Käsitöö ja kodundus","kooliaste":"II kooliaste - 4.-6. klass","maht":3,"kvalVastavus":null},{"oppeaine":"Käsitöö ja kodundus","kooliaste":"III kooliaste - 7.-9. klass","maht":2,"kvalVastavus":null},{"oppeaine":"Tööõpetus","kooliaste":"I kooliaste - 1.-3. klass","maht":3,"kvalVastavus":null},{"oppeaine":"Tehnoloogiaõpetus","kooliaste":"III kooliaste - 7.-9. klass","maht":2,"kvalVastavus":null},{"oppeaine":"Tehnoloogiaõpetus","kooliaste":"II kooliaste - 4.-6. klass","maht":3,"kvalVastavus":null}],"haridustase":null,"lapsehooldusPuhkus":"Ei"},{"liik":"POHIKOOL","oppeasutus":"Lagedi Kool","oppeasutusId":634,"ametikoht":"õpetaja","ametikohtAlgus":"2017-09-24","ametikohtLopp":null,"onTunniandja":1,"onOppejoud":0,"kehtiv":1,"taitmiseViis":null,"amtikohtKoormus":0.27,"tooleping":null,"ametikohtKvalVastavus":"Jah","ametijark":null,"oppekava":[],"oppeaine":[{"oppeaine":"Tööõpetus","kooliaste":"III kooliaste - 7.-9. klass","maht":3,"kvalVastavus":null},{"oppeaine":"Tööõpetus","kooliaste":"II kooliaste - 4.-6. klass","maht":3,"kvalVastavus":null}],"haridustase":null,"lapsehooldusPuhkus":"Ei"}],"taiendkoolitus":[{"oppeasutus":"AS BIT","nimetus":"Tehnoloogiaõpetus 7. klassile","liik":"Tööalane täienduskoolitus","loppKp":"2012-05-02","maht":4},{"oppeasutus":"Aegviidu Kool","nimetus":"Õpetaja kutsestandard ja õpetajakutse taotlemine","liik":"Tööalane täienduskoolitus","loppKp":"2014-10-23","maht":2},{"oppeasutus":"Aegviidu Kool","nimetus":"Karjääri planeerimine õppetunnis","liik":"Tööalane täienduskoolitus","loppKp":"2015-10-13","maht":3},{"oppeasutus":"Eesti Punane Rist Esmaabikoolitus","nimetus":"Esmaabi täiendkursus","liik":"Muu koolitus","loppKp":"2015-10-19","maht":8},{"oppeasutus":"Aegviidu Kool","nimetus":"Kolleegilt kolleegile","liik":"Tööalane täienduskoolitus","loppKp":"2016-01-10","maht":4},{"oppeasutus":"Aegviidu Kool","nimetus":"Ettevõtliku kooli rakenduskoolitus","liik":"Tööalane täienduskoolitus","loppKp":"2016-03-13","maht":5},{"oppeasutus":"Tallinna Ülikool","nimetus":"Loon, katsetan ja jagan 1.õpituba \"Loomine ja suhestumine - kunstiõppeprotsessi kaks võrdset osa\"","liik":"Tööalane täienduskoolitus","loppKp":"2016-04-03","maht":12},{"oppeasutus":"Aegviidu Kool","nimetus":"Ettevõtliku kooli standardkoolitus","liik":"Tööalane täienduskoolitus","loppKp":"2016-06-15","maht":6},{"oppeasutus":"Eesti Käsitööõpetajate Selts \"Aita\"","nimetus":"Elu supelsakste pealinnas","liik":"Tööalane täienduskoolitus","loppKp":"2016-10-24","maht":8},{"oppeasutus":"Aegviidu Kool","nimetus":"Tegutsemine äkkrünnaku puhul","liik":"Tööalane täienduskoolitus","loppKp":"2017-04-03","maht":1},{"oppeasutus":"Eesti Käsitööõpetajate Selts \"Aita\"","nimetus":"Kui hoiame, siis jääme","liik":"Tööalane täienduskoolitus","loppKp":"2017-07-06","maht":24},{"oppeasutus":"Eesti Käsitööõpetajate Selts","nimetus":"Pitsi- ja piirimaa","liik":"Tööalane täienduskoolitus","loppKp":"2017-10-23","maht":13},{"oppeasutus":"MTÜ Eesti tehnoloogiakasvatuse Liit","nimetus":"Tehnoloogiline kirjaoskus praktikasse","liik":"Tööalane täienduskoolitus","loppKp":"2017-10-26","maht":15},{"oppeasutus":"Tartu Ülikool","nimetus":"Tööõpetuse konverents 2018 -Mõtlevad käed","liik":"Tööalane täienduskoolitus","loppKp":"2018-01-18","maht":8},{"oppeasutus":"Eesti Tööõpetajate Selts","nimetus":"Muutunud õpikäsitlus töö- ja tehnoloogiaõpetuses","liik":"Tööalane täienduskoolitus","loppKp":"2018-02-09","maht":8},{"oppeasutus":"Eesti Käsitööõpetajate Selts AITA","nimetus":"Käsitööõpetajate kevadseminar Helsingis","liik":"Tööalane täienduskoolitus","loppKp":"2018-04-23","maht":6}],"tasemeharidus":[{"kvalDokument":"magistriõppe õppekava lõpetamisel magistrikraadi tõendav diplom \"M\"","kvalVastavus":"Magistrikraad või vastav kvalifikatsioon","oppeasutus":"Tallinna Ülikool","erialaOppekava":"Käsitöö ja kodunduse õpetaja (kood 1631)","lopetanud":"2016-06-01","dokument":"MC006209"},{"kvalDokument":"alates 1. juunist 2002 õppekavade registrisse kantud 3 - 4a bakalaureuseõppe õppekava lõpetamisel antud bakalaureusekraadi tõendav bakalaureuseõppe diplom \"L\"","kvalVastavus":"Bakalaureusekraad või vastav kvalifikatsioon","oppeasutus":"Tallinna Ülikool","erialaOppekava":"Käsitöö ja kodundus (kood 1606)","lopetanud":"2013-06-04","dokument":"LC008330"},{"kvalDokument":"lõputunnistus põhihariduse baasil kutsekeskhariduse omandamise kohta","kvalVastavus":"Keskharidus  või vastav kvalifikatsioon","oppeasutus":"Tartu Kunstikool","erialaOppekava":"kunstiline kujundamine","lopetanud":"1991-06-13","dokument":"025359"}],"kvalifikatsioon":[]}}';
		$this->client->hset('47108249296', 'eeIsikukaart', $json);
	}
	public function testApplications(){
		$json = '{"documents":[{"form_name":"VPT_ESITATUD_TAOTLUS_OTSUS","identifier":38328,"document_date":"2015-01-21","status":"Heaks kiidetud"},{"form_name":"VPT_ESITATUD_TAOTLUS_OTSUS","identifier":3424,"document_date":"2013-09-03","status":"Tagasi lükatud"}]}';
		$this->client->hset('49902257019', 'vpTaotlus', $json);
	}
	public function testOptions(){
		$json = '{
    "18052": {
      "et": "Noortelaagri tegevusluba (püsilaager)",
      "valid": true
    },
    "18053": {
      "et": "Turvatöötaja õppe korraldaja tegevusluba",
      "valid": true
    },
    "18055": {
      "et": "Mootorsõidukijuhi koolitusasutuse tegevusluba",
      "valid": true
    },
    "18057": {
      "et": "Üldhariduskooli tegevusluba",
      "valid": true
    },
    "18058": {
      "et": "Koolieelse lasteasutuse tegevusluba",
      "valid": true
    },
    "18098": {
      "et": "Täiskasvanuhariduse majandustegevusteade",
      "valid": false
    },
    "18099": {
      "et": "Vedurijuhi koolituse tegevusluba",
      "valid": true
    },
    "18100": {
      "et": "Eesti keele tasemeeksami koolituse tegevusluba",
      "valid": true
    },
    "18102": {
      "et": "Lasteaed-põhikool tegevusluba",
      "valid": true
    },
    "18189": {
      "et": "Noortelaagri tegevusluba (projektlaager)",
      "valid": true
    }
  }';
		$this->client->hSet('klassifikaator', 'tegevusloaLiigid', $json);
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
	 * @return int
	 */
	private function getCurrentUserIdCode(){
		$user_id = $this->currentUser->id();
		#return '41103161417';
		return ($id_code = User::load($user_id)->get('field_user_idcode')->value) ? $id_code : 0;
	}

	/**
	 * @param array $params
	 * @return array|mixed|\Psr\Http\Message\ResponseInterface
	 */
	public function getProfessionalCertificate(array $params = []){
		// build url params for GET request
		$params['url'] = [$this->getCurrentUserIdCode(), 'true', time()];
		$params['key'] = $this->getCurrentUserIdCode();
		$params['hash'] = 'kodanikKutsetunnistus';
		return $this->invokeWithRedis('kodanikKutsetunnistus', $params, FALSE);
	}

	public function getTestSessions(array $params = []){
		$params['url'] = [$this->getCurrentUserIdCode(), time()];
		$params['key'] = $this->getCurrentUserIdCode();
		$params['hash'] = 'testsessioonidKod';
		return $this->invokeWithRedis('testsessioonidKod', $params, FALSE);
	}

	public function gettestidKod(array $params = []){
		$params['url'] = [$this->getCurrentUserIdCode(), $params['session_id'], time()];
		$params['key'] = $this->getCurrentUserIdCode();
		$params['hash'] = 'testidKod_'.$params['session_id'];
		return $this->invokeWithRedis('testidKod', $params, FALSE);
	}

	public function getCertificate(array $params = []){
		$params['url'] = [$this->getCurrentUserIdCode(), $params['certificate_id'], time()];
		$params['key'] = $this->getCurrentUserIdCode();
		$params['hash'] = 'eTunnistusKod_'.$params['certificate_id'];
		return $this->invokeWithRedis('eTunnistusKod', $params, FALSE);
	}

	/**
	 * @param array $params
	 * @return mixed
	 */
	public function getPersonalCard(array $params = []){
		$params['url'] = [$this->getCurrentUserIdCode(), time()];
		$params['key'] = $this->getCurrentUserIdCode();
		$params['hash'] = 'eeIsikukaart';
 		$response = $this->invokeWithRedis('eeIsikukaart', $params, FALSE);
		return $this->filterPersonalCard($response, $params['tab']);
	}

	/**
	 * @param array $params
	 * @return array|mixed|\Psr\Http\Message\ResponseInterface
	 */
	public function getApplications(array $params = []){
		$params['url'] = [$this->getCurrentUserIdCode()];
		$params['key'] = $this->getCurrentUserIdCode();
		#dump($params['init']);
		// we need to start getDocument service
		if($params['init']){
			$params['hash'] = 'getDocuments';
			$init = $this->invokeWithRedis('getDocuments', $params, FALSE);
			if(!isset($init['MESSAGE']) && $init['MESSAGE'] != 'WORKING') {
				throw new RequestException('Service down');
			}
		}
		$params['hash'] = 'vpTaotlus';
		$response = $this->invokeWithRedis('vpTaotlus', $params);
		$this->getFormDefinitionTitle($response);
		return $response;
	}

	public function getDocument(array $params = []){
		$params['url'][] = $this->getCurrentUserIdCode();
		return $this->invoke('getDocument', $params);
	}

	public function getDocumentFile(array $params = []){
		$params['url'] = [$params['file_id'], $this->getCurrentUserIdCode()];
		return $this->invoke('getDocumentFile', $params);
	}

	public function getOptionsTaxonomy(array $params = []){
		$params['key'] = 'klassifikaator';
		$return = $this->invokeWithRedis('mtsysKlfTeenus', $params, FALSE);
		if(!$return['redis_hit']){

			return (isset($return[$params['hash']])) ? $return[$params['hash']] : [];
		}
		return $return;
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

	private function getFormDefinitionTitle(&$response){
		/* @var \Drupal\htm_custom_xjson_services\xJsonService $xjsonContainer */
		$xjsonContainer = \Drupal::service('htm_custom_xjson_services.default');

		if(is_array($response['documents'])){
			foreach($response['documents'] as &$document){
				$d = $xjsonContainer->getEntityJsonObject($document['form_name']);
				if($d){
					$document['title'] = $d['body']['title'];
				}else{
					$this->logger->notice('getDocuments response @form_name title not found!', ['@form_name' => $document['form_name']]);
				}
			}
		}

		return $response;
	}



}
