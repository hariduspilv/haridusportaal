<?php

namespace Drupal\htm_custom_ehis_connector;

use Drupal\Component\Datetime\DateTimePlus;
use Drupal\Core\Logger\LoggerChannelFactoryInterface;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\Core\Site\Settings;
use Drupal\htm_custom_xjson_services\xJsonService;
use Drupal\redis\ClientFactory;
use Drupal\rest\ModifiedResourceResponse;
use GuzzleHttp\Exception\RequestException;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class EhisConnectorService.
 */
class EhisConnectorService {

  protected $loime_url;
  /**
   * Drupal\Core\Session\AccountProxyInterface definition.
   *
   * @var \Drupal\Core\Session\AccountProxyInterface
   */
  protected $currentUser;

  /**
   * @var \Redis
   */
  protected $client;

  /**
   * @var \Drupal\Core\Logger\LoggerChannelInterface
   */
  protected $logger;


  /**
   * @var \Drupal\htm_custom_authentication\CustomRoleSwitcher;
   */
  protected $currentRole;

  var $ed_map = [
    'ownerType' => 'pidajaLiigid',
    'ownershipType' => 'oppeasutuseOmandivormid',
    'studyInstitutionType' => 'oppeasutuseLiigid'
  ];
  /**
   * @var xJsonService
   */
  protected $xJsonService;


  /**
   * EhisConnectorService constructor.
   *
   * @param AccountProxyInterface         $current_user
   * @param ClientFactory                 $client_factory
   * @param LoggerChannelFactoryInterface $logger
   */
  public function __construct(
    AccountProxyInterface $current_user,
    ClientFactory $client_factory,
    LoggerChannelFactoryInterface $logger) {
    $this->currentUser = $current_user;
    $this->client = $client_factory->getClient();
    $this->logger = $logger->get('ehis_connector_service');
    $this->currentRole = \Drupal::service('current_user.role_switcher')->getCurrentRole();
    $this->loime_url = settings::get('loime_default_url');
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
        if($service_name === 'getDocument'){
          $response = $client->get($this->loime_url.$service_name . '/' . $params['form_name'].'/'.$params['idcode'].'?'. implode($params['url'], '&'));
        } else {
          $response = $client->get($this->loime_url.$service_name . '/' . implode($params['url'], '/'));
        }
      }elseif($type === 'post'){
        $params['headers'] = [
          'Content-Type' => 'application/json'
        ];
        $response = $client->post($this->loime_url.$service_name, $params);
      }else{
        //TODO throw error
      }
      $response = json_decode($response->getBody()->getContents(), TRUE);
      return $response;
    }catch (RequestException $e){
      return false;
    }
  }

  /**
   * @param $key
   * @param $hash
   * @return array|mixed
   */
  private function getValue($key, $hash){
    $response = [];
    if($data = $this->client->hGet($key, $hash)){
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

  private function deleteFromRedis($key, $hash){
    $response = $this->client->hDel($key, $hash);
    return $response;
  }

  public function deleteKeyFromredis($key){
    $this->client->del($key);
  }


  /**
   * @param bool $idcode
   *  If true return IDcode
   * @return mixed
   */
  public function getCurrentUserIdRegCode($idcode = FALSE){
    #dump($this->currentRole);
    if($this->useReg() && !$idcode){
      return $this->currentRole['current_role']['data']['reg_kood'];
    }else{
      #return '37112110025';
      return $this->currentUser->getIdCode();
    }
  }

  public function getCurrentUserName(){
    #dump($this->currentRole);
    if($this->useReg()){
      return $this->currentRole['current_role']['data']['nimi'];
    }else{
      return null;
    }
  }

  /**
   * @return bool
   */
  public function useReg(){
    if($this->currentRole['current_role']['type'] === 'juridical_person') return true;
    return false;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getProfessionalCertificate(array $params = []){
    // build url params for GET request
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), 'true', time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'kodanikKutsetunnistus';
    return $this->invokeWithRedis('kodanikKutsetunnistus', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getTestSessions(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'testsessioonidKod';
    return $this->invokeWithRedis('testsessioonidKod', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function gettestidKod(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), $params['session_id'], time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'testidKod_'.$params['session_id'];
    return $this->invokeWithRedis('testidKod', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getCertificate(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), $params['certificate_id'], time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'eTunnistusKod_'.$params['certificate_id'];
    return $this->invokeWithRedis('eTunnistusKod', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getCertificatePublic(array $params = []){
    $params['url'] = [$params['id_code'], $params['certificate_id'], time()];
    $params['key'] = $params['id_code'];
    $params['hash'] = 'eTunnistuskehtivus_'.$params['certificate_id'];
    return $this->invokeWithRedis('eTunnistusKehtivus', $params, FALSE);
  }

  /**
   * @param array $params
   * @return mixed
   */
  public function getPersonalCard(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode(TRUE), time()];
    $params['key'] = $this->getCurrentUserIdRegCode(TRUE);
    $params['hash'] = 'eeIsikukaart';
    $response = $this->invokeWithRedis('eeIsikukaart', $params, FALSE);
    return $this->filterPersonalCard($response, $params['tab']);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  /*@TODO something wrong here*/
  public function getDocument(array $params = [], $regcode = false){
    if(!$regcode) {
      $params['idcode'] = $this->getCurrentUserIdRegCode();
    }
    return $this->invokeWithRedis('getDocument', $params, FALSE);
  }

  /**
   * @param array $params
   * @return mixed|\Psr\Http\Message\ResponseInterface
   */
  public function postDocument(array $params = []){
    return $this->invoke('postDocument', $params, 'post');
  }

  public function addInstitution(array $params = []){
    $data = $this->buildInstitutionData($params['data']);
    $post_data = [
      'json' => $data
    ];

    return $this->invoke('postEducationalInstitution/'.$this->getCurrentUserIdRegCode(TRUE) , $post_data, 'post');
  }

  public function editInstitution(array $params = []){
    #$params['edId'] = '7274';
    $institution = $this->getEducationalInstitution(['id' => $params['data']['edId']]);
    $params['data']['existing']['institution'] = $institution;

    $data = $this->buildInstitutionData($params['data'], true);

    $post_data = [
      'json' => $data
    ];
    $return = $this->invoke('postEducationalInstitution/'.$this->getCurrentUserIdRegCode(TRUE) , $post_data, 'post');

    //everything is fine delete cache
    if(!isset($return['error'])){
      $key = $this->getCurrentUserIdRegCode();
      $hash = 'educationalInstitution_'.$params['data']['edId'];
      $this->deleteFromRedis($key, $hash);
    }

    return $return;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getDocumentFile(array $params = []){
    $params['url'] = [$params['file_id'], $this->getCurrentUserIdRegCode(TRUE)];
    return $this->invokeWithRedis('getDocumentFile', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getDocumentFileFromRedis(array $params = []){
    if(!isset($params['key'])){
      $params['key'] = 'VPT_documents';
    }
    return $this->client->hGet($params['key'], $params['hash']);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getUserRoles(array $params = []){
    /* @TODO $lang_code later as variable */
    $lang_code = 'EST';
    $params['url'] = [$this->getCurrentUserIdRegCode(true), $lang_code, time()];
    $params['key'] = $this->getCurrentUserIdRegCode(true);
    $params['hash'] = 'esindusOigus';
    return $this->invokeWithRedis('esindusOigus', $params, FALSE);
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getEducationalInstitutionName(array $params = []){
    $params['key'] = 'klassifikaator';
    $return = $this->invokeWithRedis('mtsysKlfTeenus', $params, FALSE);
    if(!$return['redis_hit']){

      return (isset($return[$params['hash']])) ? $return[$params['hash']] : [];
    }
    unset($return['redis_hit']);
    return $return;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getOptionsTaxonomy(array $params = []){
    $params['key'] = 'klassifikaator';
    $return = $this->invokeWithRedis('mtsysKlfTeenus', $params, FALSE);

    if(!$return['redis_hit']){
      return (isset($return[$params['hash']])) ? $return[$params['hash']] : [];
    }
    $processedArray = [];
    foreach($return as $key => $value) {
      if($key !== 'redis_hit' && ($value['valid'] || isset($value['okLiik']))){
        $processedArray[] = [
          'key' => $value['et'],
          'value' => $key,
        ];
      }
    }
    return $processedArray;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getEducationalInstitution(array $params = []){
    $params['url'] = [$params['id'], $this->getCurrentUserIdRegCode(), $this->getCurrentUserIdRegCode(TRUE)];
    $params['key'] = $this->getCurrentUserIdRegCode();
    $params['hash'] = 'educationalInstitution_'.$params['id'];
    $response = $this->invokeWithRedis('getEducationalInstitution', $params, FALSE);
    if($params['addTitle']){
      $this->addTitles($response);
    }
    return $response;
  }

  public function getEducationalInstitutionClassificators(array $params = []){
    $taxonomy = [];
    foreach($this->ed_map as $key => $value){
      $taxonomy[$key] = $this->getAllClassificators(['hash' => $value]);
    }

    return $taxonomy;
  }

  /**
   * @param array $params
   * @return array|mixed|\Psr\Http\Message\ResponseInterface
   */
  public function getApplications(array $params = []){
    $params['url'] = [$this->getCurrentUserIdRegCode()];
    $params['key'] = $this->getCurrentUserIdRegCode();

    if($this->useReg()) $params['hash'] = 'mtsys';
    if(!$this->useReg()) $params['hash'] = 'vpTaotlus';
    #dump($params);
    $response = $this->invokeWithRedis('vpTaotlus', $params);
    \Drupal::logger('xjson')->notice('<pre><code>response' . print_r($response, TRUE) . '</code></pre>' );

    // we need to start getDocument service
    if($params['init']){
      $queryparams = $params;
      $queryparams['hash'] = 'getDocuments';
      $init = $this->invokeWithRedis('getDocuments', $queryparams, FALSE);
      if(!isset($init['MESSAGE']) && $init['MESSAGE'] != 'WORKING') {
        throw new RequestException('Service down');
      }
    }

    $workedResponse = $this->applicationPathWorker($response);
    if(isset($workedResponse['educationalInstitutions'])){
      foreach($workedResponse['educationalInstitutions'] as &$institution){
        $institution = $this->applicationPathWorker($institution);
      }
    }

    $this->getFormDefinitionTitle($workedResponse, $params['hash']);
    if(isset($params['get_edi_data']) && $params['get_edi_data']){
      $this->addInstitutionData($workedResponse);
    }
    return $workedResponse;
  }

  private function applicationPathWorker($datafields){
    $workedValues = [];
    foreach($datafields as &$field){
      if(is_array($field)){
        foreach($field as &$values){
          if(isset($values['form_name'])){
            $values['form_path'] = isset($workedValues[$values['form_name']]) ? $workedValues[$values['form_name']] : $this->getEntityFormPath($values['form_name']);
          }
        }
      }
    }
    return $datafields;
  }

  private function getEntityFormPath ($form_name)
  {
    $entityStorage = \Drupal::entityTypeManager()->getStorage('x_json_entity');
    $connection = \Drupal::database();
    $query = $connection->query("SELECT id FROM x_json_entity WHERE xjson_definition->'header'->>'form_name' = :id ", [':id' => $form_name]);
    $result = $query->fetchField();
    if ($result) {
      $entity = $entityStorage->load($result);
      $response = urldecode($entity->toUrl()->toString());
      return $response;
    }
    return false;
  }

  /**
   * @param array $params
   * @return mixed
   */
  private function getAllClassificators(array $params = []){
    $params['key'] = 'klassifikaator';
    return json_decode($this->client->hGet($params['key'], $params['hash']), TRUE);
  }

  /**
   * @param $input
   * @param $tab
   * @return mixed
   */
  private function filterPersonalCard($input, $tab){
    switch ($tab){
      case 'studies':
        $keys = ['oping', 'isikuandmed'];
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
    if(isset($input['value'])){
      foreach($input['value'] as $key => $value){
        if(!in_array($key, $keys)) unset($input['value'][$key]);
      }
    }

    return $input;
  }

  /**
   * @return mixed
   */
  private function getxJsonService(){
    return \Drupal::service('htm_custom_xjson_services.default');
  }

  /**
   * @param $response
   * @param $type
   * @return mixed
   */
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

  private function addInstitutionData(&$response){
    if(isset($response['educationalInstitutions'])){
      foreach($response['educationalInstitutions'] as &$institution){
        $institution_data  = $this->getEducationalInstitution(['id' => $institution['id'], 'addTitle' => true]);
        if(isset($institution_data['educationalInstitution']) && !empty($institution_data['educationalInstitution'])) $institution['institutionInfo'] = $institution_data['educationalInstitution'];
      }
    }
    return $response;
  }

  /**
   * @param $obj
   * @param $form_topics
   * @return mixed
   */
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

  /**
   * @param $response
   * @return mixed
   */
  private function addTitles(&$response){
    if(isset($response['educationalInstitution'])){
      array_walk($response['educationalInstitution'], function(&$item, $key, $data){
        $elm_topics = array_keys($data['topics']);
        foreach($item as $value_key => &$value ){
          if(in_array($value_key, $elm_topics)){
            $redis_value = self::getAllClassificators(['hash' => $data['topics'][$value_key]]);
            $item[$value_key.'Type'] = ($d = $redis_value[$value]) ? $d : ['et' => 'Puudub', 'valid' => false];
          }
        }
      }, ['topics' => $this->ed_map]);
    }

    return $response;
  }

  private function buildInstitutionData($data, $edit = FALSE){

    if($edit){
      $existing_institution = $data['existing']['institution']['educationalInstitution'];
    }

    $map = [
      'educationalInstitutionId'  => ($edit) ? (int) $data['edId'] : NULL,
      'ownerId'  => (int) $this->getCurrentUserIdRegCode(),
      'ownerName'  => $this->currentRole['current_role']['data']['nimi'],
      'educationalInstitution'  => [
        'generalData'  => [
          'owner' => ($edit) ? $existing_institution['generalData']['owner'] : '', //optional, uue õppeasutuse lisamiseks ei ole vaja, õppeasutuse andmete muutmisel saab väärtuse REST /api/getEducationalInstitution/ endpointist
          'name'  => ($edit) ? $existing_institution['generalData']['name'] : $data['general']['name'],
          'nameENG'  => ($edit) ? $existing_institution['generalData']['nameENG'] : $data['general']['nameENG'], //optional
          'ownerType'  => ($edit) ? (int) $existing_institution['generalData']['ownerType'] : (int) $data['general']['ownerType'],
          'ownershipType'  => ($edit) ? (int) $existing_institution['generalData']['ownershipType'] : (int) $data['general']['ownershipType'],
          'studyInstitutionType' => ($edit) ? (int) $existing_institution['generalData']['studyInstitutionType'] : (int) $data['general']['studyInstitutionType']
        ],
        'address' => [
          'seqNo' => $data['address']['seqNo'],
          'adsId' => $data['address']['adsId'],
          'adsOid' => $data['address']['adsOid'],
          'klElukoht' => $data['address']['klElukoht'],
          'county' => $data['address']['county'],
          'localGovernment' => $data['address']['localGovernment'] ,
          'settlementUnit' => $data['address']['settlementUnit'] ,
          'address' => $data['address']['address'] ,
          'addressFull' => $data['address']['addressFull'] ,
          'addressHumanReadable' => $data['address']['addressHumanReadable']
        ],
        'contacts'  => [
          'contactPhone'  => $data['contacts']['contactPhone'],
          'contactEmail'  => $data['contacts']['contactEmail'],
          'webpageAddress'  => $data['contacts']['webpageAddress']
        ]
      ]
    ];

    return $map;
  }



}
